import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.config.js";

export const prismaClient = new PrismaClient();

export async function connectToDatabase() {
  try {
    await prismaClient.$connect();
    logger.info("Connected to Database");
  } catch (error) {
    logger.info(error);
    process.exit(1);
  }
}
