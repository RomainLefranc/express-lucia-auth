import { NextFunction } from "express";
import { HttpException } from "@exceptions/HttpException.js";

export const NotFoundMiddleware = (next: NextFunction) => {
  next(new HttpException(404, "Not Found"));
};
