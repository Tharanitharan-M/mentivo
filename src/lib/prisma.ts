import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Prevent multiple PrismaClient instances during Next.js hot-reloading.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // PrismaNeon accepts a PoolConfig directly, not a Pool instance.
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
