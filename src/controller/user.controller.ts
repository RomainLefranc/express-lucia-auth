import { NextFunction, Request, Response } from "express";
import { UpdateUserBody } from "@dtos/user.dto.js";
import { auth } from "@config/index.config.js";
import { HttpException } from "@exceptions/HttpException.js";
import { prismaClient } from "@config/db.config.js";

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
    const user = await prismaClient.user.findUnique({
      where: {
        id: req.user.userId,
      },
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const { firstName, lastName, password } = req.body;

    await auth.updateKeyPassword("email", user.email, password);

    const updatedUser = await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    res.json({
      updatedUser,
    });
  } catch (error) {
    next(error);
  }
}
