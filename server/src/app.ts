import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { environment } from "./config/environment.js";
import { registerRoutes } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: environment.allowCorsOrigins,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  registerRoutes(app);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  return app;
};
