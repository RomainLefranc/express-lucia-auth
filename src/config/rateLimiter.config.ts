import mongoose from "mongoose";
import { RateLimiterMongo } from "rate-limiter-flexible";

const config = {
  storeClient: mongoose.connection,
  points: 10,
  duration: 1,
};

export const rateLimiter = new RateLimiterMongo(config);
