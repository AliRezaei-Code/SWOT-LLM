# Water Quality Technical Assistant (SWOT-LLM)

This repository contains a reference implementation of the Water Quality Technical Assistant Chatbot described in
[`wqta-project.md`](wqta-project.md). The goal is to provide a structured, template-aware Retrieval Augmented Generation (RAG)
system that supports both internal grant writing workflows and external field operations focused on chlorination management.

## Features

- **Knowledge base management** – Load internal documents and LaTeX-aligned templates with metadata.
- **Retrieval pipeline** – Lightweight keyword-based retriever that demonstrates how relevant context is gathered for prompts.
- **Generation layer** – Deterministic content generator that produces LaTeX or human-readable recommendations based on mode.
- **Telemetry integration** – Simple ingestion and normalization of chlorine telemetry to drive dosing advice.
- **Validation and record keeping** – Ensure generated sections follow required structure and persist recommendations with
  citations for future audit.
- **Command line interface** – A `swot-llm` CLI offering internal and external modes plus a scheduled daily run example.

The codebase is intentionally lightweight so that it can run entirely offline, while still illustrating how the full system
can be extended with more sophisticated retrieval, large language models, and user interfaces.

## Getting Started

1. **Install dependencies**

   ```bash
   pip install -e .
   ```

2. **Explore the CLI**

   Generate internal LaTeX-ready grant content:

   ```bash
   swot-llm internal --template grant_proposal --topic "Rural chlorination upgrade"
   ```

   Produce external operational advice with telemetry:

   ```bash
   swot-llm external --site demo_plant
   ```

   Execute the automated daily job simulation:

   ```bash
   swot-llm daily-run --site demo_plant
   ```

## Repository Layout

```
src/swot_llm/
├── cli.py               # Command line entry points
├── knowledge_base.py    # Document and template loading utilities
├── retriever.py         # Lightweight keyword retrieval pipeline
├── generator.py         # Structured content generator for internal/external modes
├── telemetry.py         # Telemetry ingestion and normalization helpers
├── recommendation.py    # Chlorine dosing logic, validation, and record storage
└── data/                # Sample documents, templates, and telemetry snapshots
```

## Next Steps

- Swap the deterministic generator with a hosted or local LLM backend.
- Replace the keyword retriever with an embedding/vector-based retriever and add relevance scoring.
- Expand the telemetry ingestion layer to cover a wider range of sensors and units.
- Connect the record store to durable storage and expose an operator-facing dashboard.

Refer to [`wqta-project.md`](wqta-project.md) for the full product vision, goals, and Mermaid diagrams guiding future work.
