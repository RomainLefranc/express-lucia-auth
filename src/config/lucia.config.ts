import { lucia } from "lucia";
import { express } from "lucia/middleware";
import { github } from "@lucia-auth/oauth/providers";
import { redis } from "@lucia-auth/adapter-session-redis";
import { redisClient } from "./redis.config.js";
import { env } from "./env.config.js";
import { prisma } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "./db.config.js";

export const auth = lucia({
  adapter: {
    user: prisma(prismaClient, {
      key: "key",
      session: null,
      user: "user",
    }),
    session: redis(redisClient),
  },
  env: env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: express(),
  getUserAttributes: (data) => {
    const {
      email,
      first_name,
      last_name,
      email_is_verified,
      verification_token,
    } = data;
    return {
      email,
      first_name,
      last_name,
      email_is_verified,
      verification_token,
    };
  },
});

export const githubAuth = github(auth, {
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
});

export type Auth = typeof auth;
