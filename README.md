# SWOT-LLM

Water Quality Technical Assistant (WQTA) is an AI-powered assistant focused on chlorination program support. It starts as an internal automation tool for grant writing and evolves into an external-facing troubleshooting companion once the core workflow is stable.

## Goals
- Deliver a browser-based assistant that guides staff through grant workflows with polished UI/UX.
- Provide dosing guidance, operational recommendations, and safety scoring when telemetry is available.
- Keep all advice grounded in an auditable knowledge base built from internal documentation, with optional external references.

## Product Scope
- **Phase 1 – Internal mode:** Responsive web application that supports template selection, corpus-grounded drafting, and LaTeX-ready exports through a guided UI.
- **Phase 2 – External mode:** practitioner experience with telemetry dashboards, dose calculators, and safety scoring.

## MERN Stack Direction
- **MongoDB:** Operational data, telemetry snapshots, and generated records stored as documents with clear audit trails.
- **Express + Node:** API surface that orchestrates retrieval augmentation, validation, and downstream integrations.
- **React + Vite:** Responsive front-end with guided flows for drafting, telemetry insights, and operator guidance.
- **Shared Types:** TypeScript types shared between client and server for end-to-end consistency.

## Front-End Status
- React + TypeScript + Vite scaffold lives in `web/`.
- Layout shell includes navigation for internal drafting, templates, telemetry dashboards, daily runs, and records.
- Tailwind CSS provides rapid UI iteration with a dark-theme baseline.
- Draft workspace now mirrors the multi-step flow defined in the design brief, and telemetry/records views provide placeholders for RAG outputs.

## Back-End Plan
- `server/` (to be scaffolded) will host an Express application with modular routers.
- MongoDB access via Mongoose or native driver (decision pending during schema design).
- RAG pipeline adapters and telemetry ingestion will be exposed as REST endpoints.
- Authentication and authorization strategy under evaluation (initially local-only).

## Repository Status
- Early MERN scaffolding phase.
- `wqta-project.md` captures the draft product brief and diagrams that drive implementation priorities.
- React front-end shell implemented; backend scaffolding underway.

## Local Development
- `web/`: `npm install && npm run dev` to launch the front-end on `http://localhost:5173`.
- `server/`: `npm install && npm run dev` to start the Express API with hot reload on `http://localhost:4000`.
- Ensure MongoDB is running locally or update `server/.env` to point at your cluster before starting the API.
- Update `ALLOW_CORS_ORIGINS` in `.env` if the front-end runs on a different origin.

## Next Steps
1. Scaffold Express server with health, corpus, and draft-generation placeholder routes.
2. Define MongoDB schemas for documents, templates, telemetry, and recommendations.
3. Implement internal drafting wizard with corpus search and output preview panes.
4. Connect front-end to backend APIs for corpus listing and draft generation.

Contributions are welcome. Please open an issue or pull request to discuss architecture or implementation choices.
