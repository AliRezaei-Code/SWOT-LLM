# SWOT Chatbot – Phase 1

An internal retrieval-augmented chatbot that helps teams interrogate their SWOT corpus with traceable, clickable citations. This repository delivers Phase 1 of the roadmap: a local-first prototype with ingestion tooling, a polished web UI, and a minimal but production-minded backend.

```
┌────────────┐     ingest.ts     ┌──────────────┐   Prisma + pgvector   ┌──────────────┐
│ Local Docs │ ───────────────▶ │  LangChain   │ ─────────────────────▶│  Postgres DB │
└────────────┘                  └──────────────┘                       └──────────────┘
       ▲                                 │                                       │
       │                                 ▼                                       ▼
       │                         RAG pipeline                           /api/chat (SSE)
       │                                 │                                       │
       ▼                                 ▼                                       ▼
┌────────────┐   streaming SSE   ┌──────────────┐   citations + sources   ┌──────────────┐
│  Web UI    │ ◀──────────────── │ Next.js API │ ◀────────────────────── │ Source Viewer│
└────────────┘                   └──────────────┘                        └──────────────┘
```

## Phase 1 scope

- Local ingestion of PDF, Markdown, and plaintext into Postgres + pgvector
- LangChain-based chunking (recursive splitter) and OpenAI `text-embedding-3-large`
- Retrieval with cosine similarity (top-k = 6) + maximum marginal relevance re-ranking (to 4)
- Streaming chat endpoint using OpenAI chat completions with inline `[Source docId:ordinal]` citations
- Two-pane Next.js 15 UI with Tailwind + shadcn/ui components, streaming transcript, stop/copy controls, and a right-side citation viewer
- Simple groundedness heuristic to flag answers lacking evidence
- No user authentication (internal-only) and no advanced metadata templates

## Getting started

### Prerequisites

- Node.js 18.18+
- pnpm 8+
- Docker Desktop (or compatible engine)
- OpenAI API key with access to `text-embedding-3-large` and GPT-4o family models

### Installation

```bash
pnpm install
```

Create your environment file:

```bash
cp .env.example .env
```

Populate the following variables:

- `OPENAI_API_KEY`
- `DATABASE_URL` (defaults to the local docker-compose connection)
- Optional: `RAG_TOP_K` to override retrieval breadth

### Run Postgres + pgvector

```bash
docker compose up -d
```

Apply migrations and generate the Prisma client:

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

Seed optional starter content:

```bash
pnpm tsx prisma/seed.ts
```

### Ingest documents

Phase 1 ingests from a local folder. Supported extensions: `.pdf`, `.md`, `.txt`.

```bash
pnpm tsx scripts/ingest.ts --root ./corpus
```

Key behaviours:

- Duplicate detection hashes `path + mtime`; use `--force` to re-process unchanged files.
- Files are chunked (1200 chars, 200 overlap), embedded in batches, and upserted with citations reset per document.
- Progress and counts are printed via `consola`.

### Run the app

```bash
pnpm dev
```

Navigate to http://localhost:3000. The chat UI streams assistant tokens, shows citation pills under each answer, and displays full source context in the right pane (mobile view collapses the pane).

### Quality checks

```bash
pnpm lint
pnpm test
pnpm build
```

The Vitest suite covers chunking and retrieval ranking. ESLint + Prettier enforce consistent formatting.

### Evaluation script

Use the sample evaluation harness to smoke-test retrieval quality against curated questions:

```bash
pnpm tsx scripts/eval_sample.ts
```

The script runs RAG end-to-end, reports hit@k for expected document paths, and averages groundedness scores.

## API surface

- `POST /api/ingest` — Development-only trigger to ingest a local directory. Body: `{ rootDir: string }`. Disabled in production.
- `POST /api/chat` — Streams Server-Sent Events (`token`, `done`, `error`). Body: `{ message: string }`.
- `GET /api/sources?id=...` — Returns the full chunk text and document metadata for the citation viewer.

## Frontend details

- Next.js App Router with server-side layout + client-side chat module
- Tailwind CSS with class-based dark mode; focus-visible rings and tooltip affordances for accessibility
- Keyboard support: `Enter` to send, `Shift+Enter` for newline
- Toast notifications via Sonner, prefers-reduced-motion respected by disabling animations

## Backend details

- Prisma ORM with Postgres 16 + pgvector (HNSW index created during migration)
- LangChain loaders for PDF/markdown/txt, recursive text splitting, and LangChain-compatible embeddings
- SSE streaming implemented with Node `ReadableStream` + OpenAI streaming completions
- Groundedness heuristic tokenises answer/citation pairs to estimate evidence coverage

## Security & compliance notes

- Phase 1 is internal-only; no authentication is enforced
- Do **not** upload sensitive content to untrusted third parties — embeddings and chat completions are sent to OpenAI
- Logging avoids persisting PII; only message role/content are stored for context recall

## Limitations & next steps

- No semantic document metadata beyond titles/paths
- No moderation / redaction pipeline; ensure corpus hygiene before ingestion
- Groundedness check is heuristic; consider model-based evaluation in later phases
- Document viewers are read-only; no feedback loop for correction yet

## License

Released under the [Apache-2.0](LICENSE) license.
