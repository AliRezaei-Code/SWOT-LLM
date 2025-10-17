# SWOT-LLM

Water Quality Technical Assistant (WQTA) is an AI-powered assistant focused on chlorination program support. It starts as an internal automation tool for grant writing and evolves into an external-facing troubleshooting companion once the core workflow is stable.

## Goals
- Deliver a streamlined browser-based chat assistant for water-quality operations teams.
- Provide answers grounded in the internal knowledge base, with retrieved snippets surfaced alongside every reply.
- Capture conversation history, prompt context, and citations for downstream auditing.

## Tech Stack
- **React + Vite (TypeScript):** Single-page chat interface with live token streaming, conversation history, and citation sidebar.
- **Express + Node:** Retrieval-augmented generation API featuring history-aware query rewriting, local embeddings, MongoDB Atlas Vector Search, and Ollama-backed generation.
- **MongoDB Atlas:** Unified store for corpus chunks (vector index) and chat history records.
- **LangChain.js:** Orchestrates ingestion, retrieval, and prompt construction while remaining fully local.

## Features
- Streaming `/api/chat` endpoint that emits conversation IDs, retrieval citations, and assistant tokens in real time via Server-Sent Events.
- Conversation persistence in MongoDB to support follow-up queries and auditing.
- Local embeddings powered by `@xenova/transformers` and lightweight LLM inference via Ollama.
- Ingestion CLI (`npm run ingest` in `server/`) to chunk Markdown/Text documents and populate the MongoDB vector index.

## Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB ≥ 6.0.11) with Vector Search enabled.
- [Ollama](https://ollama.com/) installed locally and configured with a lightweight model such as `llama3:8b` or `gemma2:2b`.

## Setup
- `cp server/.env.example server/.env` and adjust the following:
  - `MONGODB_URI`, `MONGODB_DB_NAME`, `MONGODB_VECTOR_COLLECTION`, `MONGODB_VECTOR_INDEX`
  - `OLLAMA_BASE_URL`, `OLLAMA_MODEL`
  - `ALLOW_CORS_ORIGINS` if the UI is hosted elsewhere
- Add Markdown or text files to `data/corpus/` (configurable via `CORPUS_DIR` env var).
- Start Ollama: `ollama serve` (and pull the model specified in `.env`).
- Run ingestion: `cd server && npm install && npm run ingest`.
- Launch services:
  - UI: `cd web && npm install && npm run dev`
  - API: `cd server && npm run dev`

## Next Steps
1. Add table/figure-aware loaders to preserve structured telemetry data during ingestion.
2. Implement post-retrieval reranking to tighten answer precision.
3. Introduce user feedback signals and quality scoring for continuous prompt tuning.
4. Layer in authentication/authorization before exposing the assistant beyond internal use.

Contributions are welcome. Please open an issue or pull request to discuss architecture or implementation choices.
