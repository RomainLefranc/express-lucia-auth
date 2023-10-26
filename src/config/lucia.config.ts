import { lucia } from "lucia";
import { express } from "lucia/middleware";
import { mongoose } from "@lucia-auth/adapter-mongoose";
import {
  userModel as User,
  sessionModel as Session,
  keyModel as Key,
} from "../model";

export const auth = lucia({
  adapter: mongoose({
    User,
    Key,
    Session,
  }),
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

export type Auth = typeof auth;
