import { Router } from "express";

import { createDraft, listDraftTemplates } from "../controllers/draftsController.js";

export const draftsRouter = Router();

draftsRouter.get("/templates", listDraftTemplates);
draftsRouter.post("/", createDraft);
