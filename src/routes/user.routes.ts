import express from "express";
import {
  login,
  forgotPassword,
  getProfile,
  logout,
  register,
  resetPassword,
  updateProfile,
  verify,
} from "../controller/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import validateResource from "../middleware/validateResource";
import {
  registerUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
  loginUserSchema,
} from "../validationSchema/user.schema";

const router = express.Router();

router.post("/register", validateResource(registerUserSchema), register);

router.post("/login", validateResource(loginUserSchema), login);

router.post("/logout", logout);

router
  .route("/profile")
  .get(isAuthenticated, getProfile)
  .put(isAuthenticated, updateProfile);

router.get(
  "/verify/:id/:verificationCode",
  validateResource(verifyUserSchema),
  verify
);

router.post(
  "/forgot-password",
  validateResource(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password/:id/:passwordResetCode",
  validateResource(resetPasswordSchema),
  resetPassword
);

export default router;
