import { Express } from "express";

import { healthRouter } from "./health.js";
import { draftsRouter } from "./drafts.js";

export const registerRoutes = (app: Express) => {
  app.use("/api/health", healthRouter);
  app.use("/api/drafts", draftsRouter);
};
