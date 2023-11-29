import { ObjectId } from "mongoose";
import { User } from "lucia";
import { envSchema } from "@config/env.config";
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
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
