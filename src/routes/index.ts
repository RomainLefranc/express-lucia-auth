import express from "express";
import user from "./user.route";
import auth from "./auth.route";

const router = express.Router();

router.use("/auth/provider", auth);

router.use("/profile", user);

export default router;
