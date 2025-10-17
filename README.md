# SWOT-LLM

Water Quality Technical Assistant (WQTA) is an AI-powered assistant focused on chlorination program support. It starts as an internal automation tool for grant writing and evolves into an external-facing troubleshooting companion once the core workflow is stable.

## Goals
- Deliver a streamlined browser-based chat assistant for water-quality operations teams.
- Provide answers grounded in the internal knowledge base, with retrieved snippets surfaced alongside every reply.
- Capture conversation history, prompt context, and citations for downstream auditing.

## Tech Stack
- **React + Vite (TypeScript):** Single-page chat experience with conversation state, citation cards, and prompt helpers.
- **Express + Node:** REST endpoint that orchestrates retrieval augmented generation. Currently a stub ready for integration.
- **MongoDB (planned):** Persistent storage for chat transcripts, document chunks, and retrieval metadata.

## Current Status
- `web/` contains a work-in-progress chat UI: message list, citation sidebar, and controls for prompt regeneration (pending backend wiring).
- `server/` exposes health and `/api/chat` placeholder routes to be connected to the RAG pipeline.
- `wqta-project.md` retains the comprehensive product brief for future expansion, but the active implementation targets the RAG chat experience only.

## Local Development
- `web/`: `npm install && npm run dev` (or `npm run dev -- --host`) launches the chat UI on `http://localhost:5173` (or the next free port).
- `server/`: `npm install && npm run dev` starts the Express API with hot reload on `http://localhost:4000`.
- Copy `server/.env.example` to `server/.env` and adjust `ALLOW_CORS_ORIGINS` if the front-end runs on a different origin.

## Next Steps
1. Connect `/api/chat` to the retrieval pipeline (chunking, embedding, search, LLM call).
2. Persist conversation turns and citation metadata in MongoDB.
3. Add evaluation hooks (feedback buttons, prompt replay) to tune model prompts.
4. Layer in authentication/role controls if the chat will be exposed beyond internal users.

Contributions are welcome. Please open an issue or pull request to discuss architecture or implementation choices.
