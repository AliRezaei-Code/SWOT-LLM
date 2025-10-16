import { Router } from "express";

import packageJson from "../../package.json" assert { type: "json" };

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    service: "wqta-server",
    version: packageJson.version,
    status: "ok",
    timestamp: new Date().toISOString()
  });
});
