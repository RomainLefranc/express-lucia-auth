import express from "express";
import { log, connectToDb } from "./config";
import router from "./routes";
import helmet from "helmet";
import rateLimiter from "./middleware/rateLimiter";
import { errorHandler, notFound } from "./middleware/error";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

connectToDb();

const app = express();

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(rateLimiter);

app.use("/api", router);

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
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecification));
}

app.use(notFound);

app.use(errorHandler);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  log.info(`App started at http://localhost:${port}`);
});
