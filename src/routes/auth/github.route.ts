import express from "express";
import * as userController from "../../controller/user.controller";

const router = express.Router();

router.get("/login", userController.githubLogin);

router.get("/callback", userController.githubCallback);

export default router;
