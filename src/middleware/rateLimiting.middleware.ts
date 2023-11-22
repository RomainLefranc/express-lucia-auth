import { NextFunction, Response, Request } from "express";
import { rateLimiter } from "@config/rateLimiter.config";

export const RateLimitingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((e) => {
      return res.status(401).json({
        message: "Too Many Requests",
      });
    });
};
