import mongoose from "mongoose";
import log from "../utils/logger";

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log.info("Connected to DB");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default connectToDb;
