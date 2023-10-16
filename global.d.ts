import { ObjectId } from "mongoose";
import { User } from "./src/model/user.model";

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
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user: Omit<User & { _id: ObjectId }, "password">;
  }
}
