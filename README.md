# AI Business Request Analyzer

Next.js + TypeScript + Tailwind + shadcn-compatible UI, Gemini, Zod, Neon PostgreSQL and pgvector.

## Six blocks
1. Foundation: environment validation, Gemini client and Neon connection.
2. Extraction: system prompt and Gemini structured JSON output.
3. Reliability: Zod input/output validation and deterministic business rules.
4. Document intelligence: chunking, Gemini embeddings, pgvector storage and retrieval.
5. Actions: Gemini function declarations dispatched through a strict allowlist; catalog and stock tools.
6. Context: conversation history, orchestration, persistence and Vitest tests.

## Setup
Node.js >=22.3 (Node 22 LTS recommended for the PDF parser and current SDK stack). Run `npm install`, copy `.env.example` to `.env.local`, add your Gemini API key and Neon development-branch DATABASE_URL, then run `npm run db:migrate`, `npm run db:seed`, and `npm run dev`.

Never commit secrets or expose them through NEXT_PUBLIC variables. `POST /api/catalog` indexes plain text/CSV/JSON content; PDF/DOCX parsing and document upload UI remain follow-up work.

## Production boundary
This is a single-workspace foundation, not yet a public multi-tenant production deployment. Before public exposure, add authentication, authorization, workspace membership enforcement, rate limits, audit logs, upload parsing/limits and review workflows. WORKSPACE_ID is a tenant boundary identifier, not authentication.

Gemini extracts; server-side business rules decide. No stock is claimed without a database check.
