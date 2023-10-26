import { Request, Response, NextFunction } from "express";
import { auth } from "../config";

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authRequest = auth.handleRequest(req, res);
  const session = await authRequest.validate();

  if (!session) {
    return res.status(401).send("Not authorized, no token");
  }

  req.user = session.user;

  next();
};

export { isAuthenticated };
