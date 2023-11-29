import * as pino from "pino";
import dayjs from "dayjs";
import { env } from "./env.config.js";

export const logger = pino.default({
  transport: {
    target: "pino-pretty",
  },
  level: env.LOG_LEVEL,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf("\n")));
  },
};
