import express from "express";
import email from "./auth/email.route";
import google from "./auth/google.route";

const router = express.Router();

router.use("/email", email);

router.use("/google", google);

export default router;
