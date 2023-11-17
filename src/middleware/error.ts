import { Response, Request, NextFunction } from "express";
import { Error } from "mongoose";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`Not Found`));
};

const errorHandler = (err: Error, req: Request, res: Response) => {
  res.status(res.statusCode).json({
    message: err.message,
  });
};

export { notFound, errorHandler };
