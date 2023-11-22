import mongoose from "mongoose";
import { logger } from "./logger.config";

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to DB");
  } catch (error) {
    logger.info(error);
    process.exit(1);
  }
}
