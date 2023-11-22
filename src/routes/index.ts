import express from "express";
import userRoute from "./user.route";
import authRoute from "./auth.route";

const router = express.Router();

router.use("/auth/provider", authRoute);

router.use("/profile", userRoute);

export default router;
