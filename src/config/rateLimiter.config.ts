import {
  IRateLimiterRedisOptions,
  RateLimiterRedis,
} from "rate-limiter-flexible";
import { redisClient } from "./redis.config";

const config: IRateLimiterRedisOptions = {
  storeClient: redisClient,
  points: 5,
  duration: 5,
  blockDuration: 10,
  useRedisPackage: true,
  keyPrefix: "rlflx",
};

export const rateLimiter = new RateLimiterRedis(config);
