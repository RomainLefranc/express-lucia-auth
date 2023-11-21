import express from "express";
import * as userController from "../../controller/user.controller";
import { ValidateResourceMiddleware } from "../../middleware/validateResource.middleware";
import {
  registerUserDto,
  forgotPasswordDto,
  resetPasswordDto,
  verifyUserDto,
  loginUserDto,
} from "../../dtos/user.dto";

const router = express.Router();

router.post(
  "/register",
  ValidateResourceMiddleware(registerUserDto),
  userController.register
);

router.post(
  "/login",
  ValidateResourceMiddleware(loginUserDto),
  userController.login
);

router.post("/logout", userController.logout);

router.get(
  "/verify/:verificationToken",
  ValidateResourceMiddleware(verifyUserDto),
  userController.verify
);

router.post(
  "/forgot-password",
  ValidateResourceMiddleware(forgotPasswordDto),
  userController.forgotPassword
);

router.post(
  "/reset-password/:passwordResetToken",
  ValidateResourceMiddleware(resetPasswordDto),
  userController.resetPassword
);

export default router;
