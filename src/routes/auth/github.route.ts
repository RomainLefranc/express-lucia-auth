import express from "express";
import * as userController from "@controller/auth.controller.js";

const router = express.Router();

router.get("/login", userController.githubLogin);

router.get("/callback", userController.githubCallback);

export default router;
