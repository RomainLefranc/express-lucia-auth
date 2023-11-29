import { connect, set } from "mongoose";
import { logger } from "./logger.config.js";
import { env } from "./env.config.js";

export async function connectToDatabase() {
  try {
    if (env.NODE_ENV !== "production") {
      set("debug", true);
    }
    await connect(env.MONGO_URI);
    logger.info("Connected to Database");
  } catch (error) {
    logger.info(error);
    process.exit(1);
  }
}
