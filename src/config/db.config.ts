import mongoose from "mongoose";
import { log } from "./logger.config";

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log.info("Connected to DB");
  } catch (error) {
    log.info(error);
    process.exit(1);
  }
}
