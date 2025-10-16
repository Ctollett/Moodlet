import { PrismaClient } from "@prisma/client";

/**
 * Centralized Prisma Client instance
 * Import this in controllers, services, etc. to access the database
 */
export const prisma = new PrismaClient();
