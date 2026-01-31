import { QdrantClient } from "@qdrant/js-client-rest";

import { env } from "./env";

// Initialize Qdrant client
console.log("✅ Qdrant configured:", {
  url: env.QDRANT_CLUSTER_URL,
  hasApiKey: !!env.QDRANT_API_KEY,
});

export const QDRANTClient = new QdrantClient({
  url: env.QDRANT_CLUSTER_URL,
  apiKey: env.QDRANT_API_KEY,
  port: 443,
  https: true,
});

// Add this test function
export const testQdrantConnection = async () => {
  try {
    console.log("🧪 Testing Qdrant connection...");

    // Test 1: List collections (read operation)
    const collections = await QDRANTClient.getCollections();
    console.log("✅ Can read collections:", collections);

    // Test 2: Get specific collection info
    const collectionInfo = await QDRANTClient.getCollection("githup-repos");
    console.log("✅ Collection info:", collectionInfo);

    // Test 3: Try a simple upsert
    const testPoint = {
      id: "test-123",
      vector: Array(1536).fill(0), // Adjust size to match your collection's vector size
      payload: { test: "data" },
    };

    await QDRANTClient.upsert("githup-repos", {
      points: [testPoint],
    });
    console.log("✅ Can write to collection!");

    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
};

/**
 * Tömmer ALLA points i en Qdrant-collection utan att radera collectionen själv.
 * Använder ett tomt must-filter som matchar varje punkt.
 *
 * @param collectionName Namn på collectionen att tömma (t.ex. "githup-repos")
 * @param wait Om true väntar vi tills operationen är committed (rekommenderas)
 * @returns Objekt med success/info
 */
export const emptyQdrantCollection = async (collectionName: string = "githup-repos", wait: boolean = true) => {
  try {
    console.log(`🧹 Tömmer collection: ${collectionName} ...`);

    const result = await QDRANTClient.delete(collectionName, {
      filter: {
        must: [], // Tom array → matchar ALLA points
      },
      wait, // Vänta på commit (bra för att se omedelbar effekt)
    });

    console.log(`✅ Alla points raderade i ${collectionName}!`, result);

    // Extra validering: hämta ny count
    const info = await QDRANTClient.getCollection(collectionName);
    console.log(`   Ny points count: ${info.points_count ?? 0}`);

    return {
      success: true,
      deleted: true,
      pointsCountAfter: info.points_count ?? 0,
      result,
    };
  } catch (error: any) {
    console.error(`❌ Kunde inte tömma ${collectionName}:`, error?.message || error);
    return {
      success: false,
      error: error?.message || String(error),
    };
  }
};
// Call it before your main code runs
// testQdrantConnection();
