import { RedisClientOptions, createClient } from "redis";
import { logger } from "./logger.config.js";

const config: RedisClientOptions = {
  password: process.env.REDIS_PASSWORD,
  database: 1,
  url: process.env.REDIS_URL,
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
