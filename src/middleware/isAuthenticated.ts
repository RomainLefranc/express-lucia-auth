import { Request, Response, NextFunction } from "express";
import { auth } from "../config/lucia";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  req.user = session.user;

  next();
};

export { isAuthenticated };
