import { HttpException } from "@exceptions/HttpException";
import { NextFunction } from "express";

export const NotFoundMiddleware = (next: NextFunction) => {
  next(new HttpException(404, "Not Found"));
};
