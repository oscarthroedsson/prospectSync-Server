import { PrismaClient } from "@prisma/client";
import { env } from "./env";

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    // Configure connection pool via URL query parameters
    // Prisma uses connection_limit and pool_timeout parameters
    let databaseUrl = env.DATABASE_URL;
    const separator = databaseUrl.includes("?") ? "&" : "?";
    const poolParams = `connection_limit=${env.DATABASE_POOL_SIZE}&pool_timeout=${env.DATABASE_POOL_TIMEOUT}`;

    // Only add if not already present in URL
    if (!databaseUrl.includes("connection_limit")) {
      databaseUrl = `${databaseUrl}${separator}${poolParams}`;
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
  return prisma;
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) await prisma.$disconnect();
}
