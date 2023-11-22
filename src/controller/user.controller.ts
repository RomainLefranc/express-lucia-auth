import { NextFunction, Request, Response } from "express";
import { UpdateUserBody } from "dtos/user.dto";
import { auth } from "@config/index";
import { userModel } from "@model/index";
import { HttpException } from "exceptions/HttpException";

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
