import { NextFunction, Request, Response } from "express";
import { UpdateUserBody } from "@dtos/user.dto.js";
import { auth } from "@config/index.config.js";
import { userModel } from "@model/index.model.js";
import { HttpException } from "@exceptions/HttpException.js";

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    return res.status(200).json({
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request<{}, {}, UpdateUserBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const { firstName, lastName, password } = req.body;

    user.firstName = firstName;
    user.lastName = lastName;

    await auth.updateKeyPassword("email", user.email, password);

    const updatedUser = await user.save();

    res.json({
      updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
