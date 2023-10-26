import express from "express";
import * as userController from "../controller/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router
  .route("/")
  .get(isAuthenticated, userController.getProfile)
  .post(isAuthenticated, userController.updateProfile);

export default router;
