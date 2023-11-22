import { connectToDatabase } from "./db.config";
import { logger } from "./logger.config";
import { type Auth, auth, githubAuth } from "./lucia.config";
import { mailer } from "./mailer.config";
import { redisClient, connectToRedis } from "./redis.config";

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
