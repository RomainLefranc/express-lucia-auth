import { NextFunction, Response, Request } from "express";
import rateLimiterMongo, {
  rateLimiterConfig,
} from "../config/rateLimiter.config";

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ratelimiter = rateLimiterConfig();

  ratelimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((e) => {
      console.log(e);
      res.status(429).send("Too Many Requests");
    });
};

export default rateLimiter;
