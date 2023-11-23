import { connect, set } from "mongoose";
import { logger } from "./logger.config";

export async function connectToDatabase() {
  try {
    if (process.env.NODE_ENV !== "production") {
      set("debug", true);
    }
    await connect(process.env.MONGO_URI);
    logger.info("Connected to Database");
  } catch (error) {
    logger.info(error);
    process.exit(1);
  }
}
