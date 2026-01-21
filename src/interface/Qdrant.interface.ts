export type QdrantCollectionName = "githup-repos";

export type RepoChunkPayload = {
  userId: string[] | null; // Needs to be array so github collabds of ownerships can be linked in vector-DB
  repoId: string;

  repoOwner: string; // Needs to be array so github collabds of ownerships can be linked in vector-DB
  collabarators: string[];
  repoPath: string | null; // keyword
  repoName: string; // keyword
  codeLanguage: string | null; // keyword

  chunkIndex: number; // integer
  fileSize: number | null; // integer

  createdAt: string; // keyword, ISO date string
};
