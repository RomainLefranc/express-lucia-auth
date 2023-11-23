import express from "express";
import * as authController from "@controller/auth.controller.js";
import { ValidateResourceMiddleware } from "@middleware/validateResource.middleware.js";
import {
  registerUserDto,
  forgotPasswordDto,
  resetPasswordDto,
  verifyUserDto,
  loginUserDto,
} from "@dtos/user.dto.js";

const router = express.Router();

router.post(
  "/register",
  ValidateResourceMiddleware(registerUserDto),
  authController.register
);

router.post(
  "/login",
  ValidateResourceMiddleware(loginUserDto),
  authController.login
);

router.post("/logout", authController.logout);

router.get(
  "/verify/:verificationToken",
  ValidateResourceMiddleware(verifyUserDto),
  authController.verify
);

router.post(
  "/forgot-password",
  ValidateResourceMiddleware(forgotPasswordDto),
  authController.forgotPassword
);

router.post(
  "/reset-password/:passwordResetToken",
  ValidateResourceMiddleware(resetPasswordDto),
  authController.resetPassword
);

export default router;
