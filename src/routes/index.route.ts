import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import userRoute from "@routes/user.route.js";
import authRoute from "@routes/auth.route.js";
import { env } from "@config/env.config.js";

const router = express.Router();

router.use("/auth/provider", authRoute);

router.use("/profile", userRoute);

if (env.NODE_ENV === "development") {
  const optionsSwaggerJsdocs = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "",
        version: "1.0.0",
      },
    },
    apis: ["./src/routes/*.ts"],
  };

  const swaggerSpecification = swaggerJsdoc(optionsSwaggerJsdocs);
  router.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecification)
  );
}

export default router;
