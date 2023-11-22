import { lucia } from "lucia";
import { express } from "lucia/middleware";
import { mongoose } from "@lucia-auth/adapter-mongoose";
import { userModel, keyModel } from "../model";
import { github } from "@lucia-auth/oauth/providers";
import { redis } from "@lucia-auth/adapter-session-redis";
import { redisClient } from "./redis.config";

export const auth = lucia({
  adapter: {
    user: mongoose({
      User: userModel,
      Key: keyModel,
      Session: null,
    }),
    session: redis(redisClient),
  },
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: express(),
  getUserAttributes: (data) => {
    return {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      emailIsVerified: data.emailIsVerified,
      verificationToken: data.verificationToken,
    };
  },
});

export const githubAuth = github(auth, {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
});

export type Auth = typeof auth;
