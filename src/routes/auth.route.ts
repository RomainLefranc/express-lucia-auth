import express from "express";
import emailProviderRoute from "./auth/email.route";
import githubProviderRoute from "./auth/github.route";

const router = express.Router();

router.use("/email", emailProviderRoute);

router.use("/github", githubProviderRoute);

export default router;
