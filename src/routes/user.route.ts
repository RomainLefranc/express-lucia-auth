import express from "express";
import * as userController from "@controller/user.controller";
import { AuthenticationMiddleware } from "@middleware/authentication.middleware";

const router = express.Router();

router
  .route("/")
  .get(AuthenticationMiddleware, userController.getProfile)
  .post(AuthenticationMiddleware, userController.updateProfile);

export default router;
