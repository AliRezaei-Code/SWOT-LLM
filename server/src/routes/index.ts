import { Express } from "express";

import { healthRouter } from "./health.js";
import { chatRouter } from "./chat.js";

export const registerRoutes = (app: Express) => {
  app.use("/api/health", healthRouter);
  app.use("/api/chat", chatRouter);
};
