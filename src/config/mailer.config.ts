import nodemailer from "nodemailer";
import { env } from "./env.config.js";

export const mailer = nodemailer.createTransport({
  secure: env.SMTP_SECURE,
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});
