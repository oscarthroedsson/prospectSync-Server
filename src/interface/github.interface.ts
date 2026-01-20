export interface IRepoFile {
  repoId: string;
  repo: string;
  repoUrl?: string;
  repoOwner: string;

  path?: string;
  sha: string;
  size?: number;
  codeLanguage: string | null;
}

export interface IRepoChunk {
  repoId: string;
  repoUrl?: string;
  repoName: string;
  path: string;

  chunkIndex: number;
  vector: number[];
  content: string;
  metadata: Record<string, any>;
}
