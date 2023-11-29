import { RedisClientOptions, createClient } from "redis";
import { logger } from "./logger.config.js";
import { env } from "./env.config.js";

const config: RedisClientOptions = {
  password: env.REDIS_PASSWORD,
  url: env.REDIS_URL,
};

export const redisClient = createClient(config);

export async function connectToRedis() {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis");
  } catch (error) {
    logger.info(error);
    process.exit(1);
  }
}
