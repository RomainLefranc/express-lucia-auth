import mongoose from "mongoose";
import { RateLimiterMongo } from "rate-limiter-flexible";

export function rateLimiterConfig() {
  return new RateLimiterMongo({
    storeClient: mongoose.connection,
    points: 10,
    duration: 1,
  });
}

export default rateLimiterConfig;
