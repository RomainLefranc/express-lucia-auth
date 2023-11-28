import { NextFunction, Request, Response } from "express";
import { HttpException } from "@exceptions/HttpException.js";

export const NotFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new HttpException(404, "Not Found"));
};
