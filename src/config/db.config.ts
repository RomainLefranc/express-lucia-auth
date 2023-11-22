import mongoose from "mongoose";
import { logger } from "./logger.config";

export async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to Database");
  } catch (error) {
    logger.info(error);
    process.exit(1);
  }
}
