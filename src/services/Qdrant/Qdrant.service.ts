import { components } from "@qdrant/js-client-rest/dist/types/openapi/generated_schema";
import type { Schemas } from "@qdrant/js-client-rest";

import { QdrantRepository } from "../../repositories/Qdrant.repository";
import { QdrantCollectionName } from "../../interface/Qdrant.interface";

type PointStruct = components["schemas"]["PointStruct"];
type PointsList = components["schemas"]["PointsList"];

export class QdrantService {
  private repo: QdrantRepository;

  constructor(collectionName: QdrantCollectionName) {
    this.repo = new QdrantRepository(collectionName);
  }

  /**
   * Upsert repo chunks (single or many)
   */
  async upsertChunks(
    collectionName: QdrantCollectionName,
    points: PointStruct[],
    options?: {
      wait?: boolean;
      ordering?: "weak" | "medium" | "strong";
    },
  ) {
    if (!points.length) return;

    const payload: PointsList = {
      points,
    };

    return this.repo.upsert(collectionName, {
      ...payload,
      ...options,
    });
  }

  /**
   * Read chunks (scroll)
   */
  async listChunks(params: Schemas["ScrollRequest"]) {
    return this.repo.show({
      with_payload: true,
      with_vector: false,
      ...params,
    });
  }

  /**
   * Get single chunk by ID
   */
  async getChunkById(id: string) {
    return this.repo.get(id);
  }

  /**
   * Delete chunks by ID
   */
  async deleteChunks(ids: string[]) {
    if (!ids.length) return;
    return this.repo.remove(ids);
  }

  /**
   * Domain helper:
   * Delete all chunks for a repo
   */
  //   async deleteRepoChunks(repoId: string) {
  //     return this.repo.removeByFilter({
  //       must: [
  //         {
  //           key: "repoId",
  //           match: { value: repoId },
  //         },
  //       ],
  //     });
  //   }
}
