export interface IRepoFile {
  owner: string;
  repo: string;
  path?: string;
  sha: string;
  size?: number;
}

export interface IRepoChunk {
  repo: string;
  owner: string;
  path: string;
  chunkIndex: number;
  vector: number[];
  content: string;
  metadata: Record<string, any>;
}
