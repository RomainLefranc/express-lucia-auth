import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().min(1),
  NODE_ENV: z.enum(["production", "development"]),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  LOG_LEVEL: z.enum(["info"]),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.coerce.boolean(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  REDIS_URL: z.string().min(1),
  REDIS_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
