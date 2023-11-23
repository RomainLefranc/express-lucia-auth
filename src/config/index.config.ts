import { connectToDatabase } from "./db.config.js";
import { logger } from "./logger.config.js";
import { type Auth, auth, githubAuth } from "./lucia.config.js";
import { mailer } from "./mailer.config.js";
import { redisClient, connectToRedis } from "./redis.config.js";

export {
  connectToDatabase,
  logger,
  Auth,
  auth,
  mailer,
  githubAuth,
  redisClient,
  connectToRedis,
};
