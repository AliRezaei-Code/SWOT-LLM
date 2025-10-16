import type { Request, Response } from "express";

import { queueDraftGeneration } from "../services/draftService.js";

export const listDraftTemplates = async (_req: Request, res: Response) => {
  res.json({
    templates: [
      {
        id: "grant-default",
        name: "Internal Grant Template",
        version: "1.0",
        summary: "Executive summary, objectives, implementation, and M&E sections."
      }
    ]
  });
};

export const createDraft = async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };

  if (!query) {
    res.status(400).json({ error: "Query is required to generate a draft." });
    return;
  }

  const job = await queueDraftGeneration(query);

  res.status(202).json({
    ...job,
    message: "Draft generation pipeline not yet connected."
  });
};
