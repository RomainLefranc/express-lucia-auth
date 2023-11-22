import { ObjectId } from "mongoose";
import { User } from "lucia";
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      NODE_ENV: string;
      MONGO_URI: string;
      JWT_SECRET: string;
      LOG_LEVEL: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      SMTP_HOST: string;
      SMTP_PORT: number;
      SMTP_SECURE: boolean;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
    }
  }
  /// <reference types="lucia" />
  namespace Lucia {
    type Auth = import("./src/config/lucia.config").Auth;
    type DatabaseUserAttributes = {
      email: string;
      firstName: string | null;
      lastName: string | null;
      emailIsVerified: boolean;
      verificationToken: string | null;
    };
    type DatabaseSessionAttributes = {};
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user: User;
  }
}
