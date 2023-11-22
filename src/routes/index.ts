import express from "express";
import userRoute from "@routes/user.route";
import authRoute from "@routes/auth.route";

const router = express.Router();

router.use("/auth/provider", authRoute);

router.use("/profile", userRoute);

export default router;
