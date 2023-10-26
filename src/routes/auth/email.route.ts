import express from "express";
import * as userController from "../../controller/user.controller";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import validateResource from "../../middleware/validateResource";
import {
  registerUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
  loginUserSchema,
} from "../../validationSchema/user.schema";

const router = express.Router();

router.post(
  "/register",
  validateResource(registerUserSchema),
  userController.register
);

router.post("/login", validateResource(loginUserSchema), userController.login);

router.post("/logout", userController.logout);

router.get(
  "/verify/:verificationToken",
  validateResource(verifyUserSchema),
  userController.verify
);

router.post(
  "/forgot-password",
  validateResource(forgotPasswordSchema),
  userController.forgotPassword
);

router.post(
  "/reset-password/:passwordResetToken",
  validateResource(resetPasswordSchema),
  userController.resetPassword
);

export default router;
