import express from "express";
import user from "./user.routes";

const router = express.Router();

router.get("/healthcheck", (_, res) => res.sendStatus(200));

router.use("/auth", user);

export default router;
