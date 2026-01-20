import { QdrantClient } from "@qdrant/js-client-rest";

import { env } from "./env";

// or connect to Qdrant Cloud
export const QDRANTClient = new QdrantClient({
  url: env.QDRANT_CLUSTER_URL,
  apiKey: env.QDRANT_API_KEY,
});
