import express from "express";
import userRoute from "@routes/user.route";
import authRoute from "@routes/auth.route";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

router.use("/auth/provider", authRoute);

router.use("/profile", userRoute);

if (process.env.NODE_ENV === "development") {
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
