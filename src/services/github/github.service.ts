import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

import { ParticipantRepoInput } from "../../repositories/repo-participant.repository";
import { AnalyzedRepoInput } from "../../repositories/analysedRepo.repository";
import { DEFAULT_CONFIG, IAnalysisConfig } from "../../constants/github-analyse.const";
import { IRepoChunk, IRepoFile } from "../../interface/github.interface";
import { RepoChunkPayload } from "../../interface/Qdrant.interface";
import { QdrantService } from "../Qdrant/Qdrant.service";
import { openAI } from "../../config";

export type FileHandlingStrategy = "DIRECT" | "STREAM" | "SKIP";

/*
todo Future - Chunking - vectorisation - uploading 
all should be moved to seperate concerns - but for now it can be handled here
*/
/**
 * @description
 * @function ingestFile - Get file, splitts to chunks - embedds it - upload to vector DB
 * @function ingestLargeFile - Stream large file, splitts to chunks - embedds it - upload to vector DB
 * @author @oscarthroedsson
 */
export class GithubService {
  private octokit: Octokit;
  /**
   * Username is not necceserly the owner of the repo, we need to verify this..
   * if it - keep going
   * if not - get the owner and verify contributions
   */
  private username: string;
  private repoName: string;
  private repoData: RestEndpointMethodTypes["repos"]["get"]["response"]["data"] | null = null;
  private userId: string;
  private QdrantService: QdrantService;
  private splitter: RecursiveCharacterTextSplitter;
  private contributors: string[] = [];

  constructor(username: string, repoName: string, userId: string, token?: string) {
    this.username = username;
    this.repoName = repoName;
    this.userId = userId;
    this.octokit = new Octokit({ auth: token });
    this.QdrantService = new QdrantService("githup-repos");
    /**
     * Details of splitting is more important when we analyse not when breaking down
     * This works just fine
     */
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: DEFAULT_CONFIG.maxChunk,
      chunkOverlap: 300,
      separators: ["\n\n", "\n", " ", "\t", ".", ",", ";", "}", "]", ")", ">", "<", "="],
      keepSeparator: true,
    });
  }

  // Will ingest a repo and ingest every file based on size
  async ingestRepo(config: IAnalysisConfig = DEFAULT_CONFIG): Promise<{
    analyzedRepo: AnalyzedRepoInput;
    participants: ParticipantRepoInput;
  }> {
    const repoData = await this.getRepo();

    // Provide data about all the files.
    const files = await this.traverseRepo(config);

    console.table(
      files.map((file) => ({
        path: file.path ?? "<no path>",
        size: file.size ?? "<unknown>",
        sha: file.sha,
      })),
    );
    console.log(`Found ${files.length} candidate files`);
    // How many files we have processed
    let processed = 0;

    /**
     * Loop over all the files and decide which strategy for getting all the file content
     */

    const { contributed, ...rest } = await this.verifyContribution();
    if (!contributed) throw new Error(`🛑 ${this.username} did not contribute to ${this.repoName}`);

    // analyse
    let usageTokens = 0;
    let chunks = 0;
    for (const file of files) {
      const strategy = this.decideFileStrategy(file.size as number, config);
      console.info("STRATEGY: ", strategy);
      if (strategy === "SKIP") continue; //
      switch (strategy) {
        case "DIRECT":
          const res = await this.ingestFile(file);

          usageTokens += res.usageToken;
          chunks += res.chunks;

          break;
        case "STREAM":
          await this.ingestLargeFile(file);
          break;
      }
      ++processed;
    }

    // upload meta-data
    const analyzedRepo = {
      repoId: repoData.id.toString(),
      repoName: this.repoName,
      repoUrl: repoData.html_url,
      repoSize: repoData.size,
      repoIsPrivate: repoData.private,

      branch: repoData.default_branch,
      codeLanguage: repoData.language,

      collectionName: "githup-repos", // vector DB collection name

      analyseText: "",
    };

    const participants = {
      username: this.username,
      isOwner: repoData.owner.login.toLocaleLowerCase() === this.username,

      contributionLevel: rest.contributionLevel,
      commitCount: rest.commitCount,
      linesAdded: rest.linesAdded,
      linesDeleted: rest.linesDeleted,
      score: rest.score,
    };

    console.log(`Processed ${processed}/${files.length} files`);

    return {
      analyzedRepo,
      participants,
    };
  }

  /**
   * Will fetch the whole file and splitt it up to chunks
   * embedd every chunk and upload it to vector database
   */

  async ingestFile(file: IRepoFile) {
    // Get file content
    const url = await this.getRawContentUrl(file);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${file.path}: ${response.statusText}`);
    const content = await response.text();

    // Create chunks - embedd and upload to vector DB

    const chunks = await this.splitter.splitText(content);
    const points: {
      id: string;
      vector: number[];
      payload: RepoChunkPayload;
    }[] = [];

    let chunkIndex = 0;
    let usageToken: number = 0;
    const createdAt = new Date().toISOString();

    for (const chunk of chunks) {
      const repoChunk = this.buildRepoChunk(file, chunk, chunkIndex++);
      console.info("🥩 Chunk is built");
      // 4. Kör embeddings här
      const embed = await this.embedChunks(chunk);
      console.log("🍀 Return embedded");
      repoChunk.vector = embed.data[0].embedding;

      // Sum up how many tokens the process took
      usageToken += embed.usage.prompt_tokens ?? 0;

      const chunkID = crypto.randomUUID();
      points.push({
        id: chunkID,
        vector: repoChunk.vector,
        payload: {
          repoId: file.repoId,
          repoOwner: (await this.getRepo()).owner.login,
          collabarators: (await this.getOwnerAndContributors()).contributors,
          userId: [this.userId],
          repoName: file.repo,
          repoPath: file?.path ?? null,
          fileSize: file?.size ?? null,
          codeLanguage: file?.codeLanguage ?? null,
          chunkIndex,
          createdAt,
        },
      });

      try {
        await this.QdrantService.upsertChunks("githup-repos", points, { wait: true });
      } catch (err) {
        console.error("🚨 [ingestFile] | QdrantService: ", err);
      }
    }

    return {
      usageToken,
      chunks: chunks.length,
    };
  }
  /**
   * Will stream a big file to textsplit, embedd and upload to vector DB
   */
  private async ingestLargeFile(file: IRepoFile, config: IAnalysisConfig = DEFAULT_CONFIG): Promise<void> {
    /*
     * NOTE:
     * This function processes the stream sequentially on purpose.
     * We `await` embeddings + storage inside the read loop to enforce
     * natural backpressure and avoid uncontrolled concurrency.
     *
     * This is safe and simple for now (Free tier, small/medium repos),
     * but not optimal for throughput.
     *
     * Future improvement:
     * - Split this into a producer (stream + chunking)
     * - And a consumer (embeddings + storage)
     * - With a bounded queue / worker pool to control concurrency
     *   without breaking rate limits or memory usage.
     */

    // ☝🏼 important if the user is not the owner but a contributor
    const repoData = await this.getRepo();
    const url = `https://raw.githubusercontent.com/${repoData.owner.login}/${file.repo}/HEAD/${file.path}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed ${file.path}`);

    let buffer = "";
    let chunkIndex = 0;
    const decoder = new TextDecoder();
    const reader = response.body!.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Validate if we should go passt
      if (!(buffer.length > DEFAULT_CONFIG.maxChunk && buffer.length < DEFAULT_CONFIG.maxChunk + 300)) continue;

      console.info("🏎️[ingestLargeFile] Went pass if-statement → Will split and embedd");
      // Splitts the chunk
      const chunks = await this.splitter.splitText(buffer);
      // Ta alla chunkar utom sista som kan vara ofullständig
      const completeChunks = chunks.slice(0, -1);
      buffer = chunks[chunks.length - 1] || "";

      /**
       * What happens if the buffer is faster then my loop ?
       */
      for (const chunk of completeChunks) {
        if (DEFAULT_CONFIG.maxChunk && chunk.length > config.maxChunk) {
          // Extra försiktighet: dela igen om det behövs (kan skapa flera sub-chunks)
          const subSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: config.maxChunk,
            chunkOverlap: 0,
          });

          const subChunks = await subSplitter.splitText(chunk);
          for (const subChunk of subChunks) {
            const repoChunk = this.buildRepoChunk(file, subChunk, chunkIndex++);
            const embedds = await this.embedChunks(repoChunk.content);

            if (!embedds) throw new Error(`🚨 [GithubService]: embedds: ${embedds}`);
            repoChunk.vector = embedds.data[0].embedding;
            /**
             *  await this.vectorizeAndStore([repoChunk]);
             */
          }
        } else {
          const repoChunk = this.buildRepoChunk(file, chunk, chunkIndex++);
          const embedds = await this.embedChunks(repoChunk.content);

          if (!embedds) throw new Error(`🚨 [GithubService]: embedds: ${embedds}`);
          repoChunk.vector = embedds.data[0].embedding;

          /**
           * await this.vectorizeAndStore([repoChunk]);
           */
        }

        if (config.maxChunk && chunkIndex >= config.maxChunk) return; // stoppa om maxChunks nås
      }
    }

    // Sista biten av buffern
    if (buffer.length > 0) {
      const repoChunk = this.buildRepoChunk(file, buffer, chunkIndex++);
      try {
        const embedds = await this.embedChunks(repoChunk.content);

        if (!embedds) throw new Error(`🚨 [GithubService]: embedds: ${embedds}`);
        repoChunk.vector = embedds.data[0].embedding;
        /**
         *    await this.vectorizeAndStore([repoChunk]);
         */
      } catch (err) {
        console.error("Embeddings got error");
        throw err;
      }
    }
  }

  // Ge the whole repo tree ex folder n files in DEFAULT_CONFIG
  async traverseRepo(config: IAnalysisConfig = DEFAULT_CONFIG): Promise<IRepoFile[]> {
    // Latest commit will give us the latest folder-structure and all latest files
    const { sha, html_url } = await this.getLatestCommit();
    const { id, owner } = await this.getRepo();
    const files: IRepoFile[] = [];
    const stack: Array<{ sha: string; path: string }> = [{ sha, path: "" }];

    while (stack.length > 0) {
      const current = stack.pop()!;

      const { data } = await this.octokit.git.getTree({
        owner: this.username,
        repo: this.repoName,
        tree_sha: current.sha,
        recursive: "false",
      });

      if (data.truncated) {
        console.warn("Tree truncated – very large repo, partial results only");
        // Du kan här välja att fortsätta eller kasta fel beroende på policy
      }

      for (const entry of data.tree) {
        const fullPath = current.path ? `${current.path}/${entry.path}` : (entry.path ?? "");

        if (entry.type === "tree") {
          if (config.excludeDirs.some((dir) => fullPath === dir || fullPath.startsWith(`${dir}/`))) continue;
          if (entry.sha) stack.push({ sha: entry.sha, path: fullPath });
        }

        // Only regular text files – skip binary files
        if (entry.type === "blob" && entry.size !== undefined && entry.size < config.fileSizePolicy.absoluteMax) {
          // Grov heuristik för textfiler (kan förbättras rejält)
          if (!this.isLikelyBinary(entry.path ?? "")) {
            files.push({
              repoId: id.toString(), // Unique ID of the repository, used to link files to metadata
              repoOwner: owner.login, // username that is used for login to github
              repo: this.repoName, // Repository name (e.g., "my-project")
              repoUrl: html_url, // URL to the repository on GitHub
              path: fullPath, // Full path of the file within the repository (e.g., "src/components/Button.tsx")
              sha: entry.sha!, // Git SHA of the file at the current commit
              size: entry.size, // File size in bytes
              codeLanguage: config.fileLang[fullPath.split(".").pop() as string] || null, // Programming language inferred from file extension
            });
          }
        }
      }
    }

    return files;
  }

  // Use openAI to embed
  private async embedChunks(chunk: string) {
    try {
      const embedding = await openAI.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });

      return embedding;
    } catch (err) {
      console.error("🚨🚨🚨 [GithubService]: embedChunks: ", err);
      throw err;
    }
  }

  private decideFileStrategy(size: number, config: IAnalysisConfig): FileHandlingStrategy {
    const { directFetchMax, absoluteMax } = config.fileSizePolicy;

    if (size > absoluteMax) return "SKIP";
    if (size <= directFetchMax) return "DIRECT";
    return "STREAM";
  }

  private isLikelyBinary(filename: string): boolean {
    const ext = filename.split(".").pop()?.toLowerCase();
    const binaryExts = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "ico",
      "pdf",
      "zip",
      "tar",
      "gz",
      "exe",
      "dll",
      "so",
      "bin",
      "wasm",
      "woff",
      "woff2",
      "ttf",
      "eot",
      "mp4",
      "webm",
    ];
    return !!ext && binaryExts.includes(ext);
  }

  private async getRawContentUrl(file: IRepoFile): Promise<string> {
    // Använd ref=HEAD för att få senaste, eller byt till branch/commit om du vill
    const repoData = await this.getRepo();
    return `https://raw.githubusercontent.com/${repoData.owner.login}/${this.repoName}/HEAD/${file.path}`;
  }

  /**
   * @description Verify usersnames contributions to the repo
   * @param pPage
   * @returns
   */
  async verifyContribution(pPage: number = 100) {
    const perPage = pPage;
    let page = 1;
    let commitCount = 0;
    let linesAdded = 0;
    let linesDeleted = 0;

    // Will only let us look at commits the of 2 years back
    const since = new Date();
    since.setFullYear(since.getFullYear() - 2);

    const data = await this.getRepo();
    const repoOwner = data.owner.login; // may not be the same as this.username

    try {
      while (true) {
        const { data: commits } = await this.octokit.repos.listCommits({
          owner: repoOwner,
          repo: this.repoName,
          author: this.username,
          since: since.toISOString(),
          per_page: perPage,
          page,
        });

        if (!commits.length) break;

        commitCount += commits.length;

        for (const commit of commits) {
          const { data: fullCommit } = await this.octokit.repos.getCommit({
            owner: repoOwner,
            repo: this.repoName,
            ref: commit.sha,
          });

          linesAdded += fullCommit.stats?.additions ?? 0;
          linesDeleted += fullCommit.stats?.deletions ?? 0;
        }

        page++;
        // Just safing for not getting 403 from github... lets start here and see what this go.
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      const score = linesAdded * 1 + linesDeleted * 0.5 + commitCount * 0.2;

      // Calculate contributions
      let contributionLevel: "none" | "minor" | "medium" | "major" = "none";
      if (score > 1000) contributionLevel = "major";
      else if (score > 300) contributionLevel = "medium";
      else if (score > 0) contributionLevel = "minor";

      return {
        contributed: commitCount > 0,
        commitCount,
        linesAdded,
        linesDeleted,
        score,
        contributionLevel,
      };
    } catch (err) {
      console.log("🚨 [verifyContribution] Error: ", err);
      throw err;
    }
  }

  private buildRepoChunk(file: IRepoFile, content: string, index: number): IRepoChunk {
    return {
      repoId: file.repoId,
      repoName: file.repo,
      repoUrl: file.repoUrl,
      path: file.path as string,
      chunkIndex: index,
      vector: [0],
      content,
      metadata: {
        sha: file.sha,
        fileSize: file.size,
        language: DEFAULT_CONFIG.fileLang[file.path as string] || "text",
      },
    };
  }

  private async getLatestCommit(): Promise<GetResponseDataTypeFromEndpointMethod<typeof this.octokit.repos.getCommit>> {
    const { data } = await this.octokit.repos.getCommit({
      owner: this.username,
      repo: this.repoName,
      ref: "HEAD",
    });

    return data;
  }

  async getRepo(username: string = this.username, repoName: string = this.repoName) {
    if (
      // Return already fetch data if it exist
      this.repoData &&
      this.repoData.owner.login === username && // check owner login
      this.repoData.name === repoName // check repo name
    ) {
      return this.repoData;
    }

    const { data } = await this.octokit.repos.get({
      owner: username,
      repo: repoName,
      ref: "HEAD",
    });
    this.repoData = data;
    return data;
  }

  async getOwnerAndContributors(): Promise<{ owner: string; contributors: string[] }> {
    const repoData = await this.getRepo();

    if (repoData.owner.login && this.contributors.length) {
      return { owner: repoData.owner.login, contributors: this.contributors };
    }

    const { data: contributors } = await this.octokit.repos.listContributors({
      owner: repoData.owner.login,
      repo: repoData.name,
      per_page: 100,
    });

    const contributorsList: string[] = (contributors ?? [])
      .map((c) => c.login)
      .filter((login): login is string => !!login && login !== repoData.owner.login);
    this.contributors = contributorsList;

    return {
      owner: repoData.owner.login,
      contributors: contributorsList,
    };
  }

  // Placeholder – implementera efter behov
  // async vectorizeAndStoreBatch(chunks: IRepoChunk[]): Promise<void> { ... }
}
