import express from "express";
import emailProviderRoute from "@routes/auth/email.route.js";
import githubProviderRoute from "@routes/auth/github.route.js";

const router = express.Router();

router.use("/email", emailProviderRoute);

router.use("/github", githubProviderRoute);

export default router;
