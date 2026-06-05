import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

(prisma as any).$on("error", (e: { message: string; target: string }) => {
  logger.error("Prisma error", { message: e.message, target: e.target });
});

(prisma as any).$on("warn", (e: { message: string; target: string }) => {
  logger.warn("Prisma warning", { message: e.message, target: e.target });
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
