import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Octokit } from "@octokit/rest";

import { DEFAULT_CONFIG, IAnalysisConfig } from "../../constants/github-analyse.const";
import { IRepoChunk, IRepoFile } from "../../interface/github.interface";
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
  private owner: string;
  private repo: string;

  private splitter: RecursiveCharacterTextSplitter;

  constructor(owner: string, repo: string, token?: string) {
    this.owner = owner;
    this.repo = repo;
    this.octokit = new Octokit({ auth: token });

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
  async ingestRepo(config: IAnalysisConfig = DEFAULT_CONFIG): Promise<void> {
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
    for (const file of files) {
      const strategy = this.decideFileStrategy(file.size as number, config);
      console.info("STRATEGY: ", strategy);
      if (strategy === "SKIP") continue; //
      switch (strategy) {
        case "DIRECT":
          await this.ingestFile(file);
          break;
        case "STREAM":
          await this.ingestLargeFile(file);
          break;
      }
    }

    console.log(`Processed ${processed}/${files.length} files`);
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
    let chunkIndex = 0;
    for (const chunk of chunks) {
      const repoChunk = this.buildRepoChunk(file, chunk, chunkIndex++);
      console.info("🥩 Chunk is built");
      // 4. Kör embeddings här
      const embed = await this.embedChunks(chunk);
      console.log("🍀 Return embedded");
      repoChunk.vector = embed.data[0].embedding;

      /**
       * Vectorise when everything else is debugged
       * await this.vectorizeAndStore([repoChunk]);
       */
    }
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
    const url = `https://raw.githubusercontent.com/${file.owner}/${file.repo}/HEAD/${file.path}`;
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
    const rootTreeSha = await this.getRootTreeSha();

    const files: IRepoFile[] = [];
    const stack: Array<{ sha: string; path: string }> = [{ sha: rootTreeSha, path: "" }];

    while (stack.length > 0) {
      const current = stack.pop()!;

      const { data } = await this.octokit.git.getTree({
        owner: this.owner,
        repo: this.repo,
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
          if (config.excludeDirs.some((dir) => fullPath === dir || fullPath.startsWith(`${dir}/`))) {
            continue;
          }
          if (entry.sha) {
            stack.push({ sha: entry.sha, path: fullPath });
          }
        }

        // Endast vanliga textfiler – skippa binära
        if (entry.type === "blob" && entry.size !== undefined && entry.size < config.fileSizePolicy.absoluteMax) {
          // Grov heuristik för textfiler (kan förbättras rejält)
          if (!this.isLikelyBinary(entry.path ?? "")) {
            files.push({
              owner: this.owner,
              repo: this.repo,
              path: fullPath,
              sha: entry.sha!,
              size: entry.size,
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
    return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/HEAD/${file.path}`;
  }

  /**
   *
   * --------------------- HELPERS ---------------------
   *
   */
  private buildRepoChunk(file: IRepoFile, content: string, index: number): IRepoChunk {
    return {
      owner: file.owner,
      repo: file.repo,
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

  private async getRootTreeSha(): Promise<string> {
    const { data } = await this.octokit.repos.getCommit({
      owner: this.owner,
      repo: this.repo,
      ref: "HEAD",
    });
    return data.commit.tree.sha;
  }

  // Placeholder – implementera efter behov
  // async vectorizeAndStoreBatch(chunks: IRepoChunk[]): Promise<void> { ... }
}
