import { Response, Request, NextFunction } from "express";
import { LuciaError } from "lucia";
import { HttpException } from "@exceptions/HttpException.js";

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status = error.status || 500;
    let message = error.message || "Something went wrong";

    if (
      error instanceof LuciaError &&
      error.message == "AUTH_DUPLICATE_KEY_ID"
    ) {
      message = "Account already exist";
    }

    if (
      error instanceof LuciaError &&
      (error.message === "AUTH_INVALID_KEY_ID" ||
        error.message === "AUTH_INVALID_PASSWORD")
    ) {
      message = "Invalid email or password";
    }

    return res.status(status).json({ message });
  } catch (error) {
    next(error);
  }
};
