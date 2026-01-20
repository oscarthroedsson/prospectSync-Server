import { components } from "@qdrant/js-client-rest/dist/types/openapi/generated_schema";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { Schemas } from "@qdrant/js-client-rest";

import { QdrantCollectionName } from "../interface/Qdrant.interface";
import { QDRANTClient } from "../config/Qdrant";

export class QdrantRepository {
  private client: QdrantClient;
  private collectionName: QdrantCollectionName;

  constructor(collectionName: QdrantCollectionName) {
    this.collectionName = collectionName;
    this.client = QDRANTClient;
  }

  /**
   * Write ensure if needed
   */

  /** Upsert one or more chunks into the collection */
  async upsert(collectionName: QdrantCollectionName, params: components["schemas"]["PointsList"]) {
    return this.client.upsert(collectionName, params);
  }

  /** Show all points metadata (can be paginated if needed) */
  async show(
    params: Schemas["ScrollRequest"] & {
      timeout?: number;
    } & {
      consistency?: Schemas["ReadConsistency"];
    },
  ) {
    const result = await this.client.scroll(this.collectionName, params);
    return result.points;
  }

  /**
   * Need to figure out how to update
   */

  /** Remove points by ID(s) */
  async remove(ids: string[]) {
    await this.client.delete(this.collectionName, {
      points: ids,
    });
  }

  /** Retrieve vector and metadata by ID */
  async get(id: string) {
    const result = await this.client.scroll(this.collectionName, {
      filter: { must: [{ key: "id", match: { value: id } }] },
      limit: 1,
    });
    return result.points[0] || null;
  }
}
