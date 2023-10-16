import { NextFunction, Response, Request } from "express";
import mongoose from "mongoose";
import { RateLimiterMongo } from "rate-limiter-flexible";

const opts = {
  storeClient: mongoose.connection,
  points: 10, // Number of points
  duration: 1, // Per second(s)
};

const rateLimiterMongo = new RateLimiterMongo(opts);

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  rateLimiterMongo
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send("Too Many Requests");
    });
};

export default rateLimiter;
