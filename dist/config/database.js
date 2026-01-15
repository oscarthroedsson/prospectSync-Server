"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const env_1 = require("./env");
let prisma;
function getPrismaClient() {
    if (!prisma) {
        prisma = new client_1.PrismaClient({
            datasources: {
                db: {
                    url: env_1.env.DATABASE_URL,
                },
            },
        });
    }
    return prisma;
}
async function disconnectDatabase() {
    if (prisma) {
        await prisma.$disconnect();
    }
}
//# sourceMappingURL=database.js.map