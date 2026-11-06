# Veyra — Commercial operations intelligence

A workspace for processing B2B customer requests, matching products, checking inventory and retrieving internal commercial knowledge.

## Product workflows

- **Overview (/):** live request outcomes, attention queue, product count, available units and indexed-document metrics from PostgreSQL.
- **New analysis (/analyzer):** submit an original customer message, extract validated requirements, retrieve catalog context, check product availability and save a decision record.
- **Request history (/requests):** search and filter persisted analyses.
- **Request record (/requests/[id]):** inspect the source message, extracted fields, decision rationale, catalog matches, stock checks and retrieved evidence.
- **Catalog & inventory (/catalog):** create product records, set initial stock, update available quantities and view the current product register.
- **Knowledge library (/catalog):** upload supported commercial documents and inspect indexing status and chunk counts.

## Core stack

- Next.js App Router, React and TypeScript
- Tailwind CSS 4 and Lucide icons
- Gemini API for structured extraction and embeddings
- Zod for input/output validation
- Neon PostgreSQL with pgvector
- Server-side catalog and inventory tools

## Local setup

Use Node.js 22.x. Install dependencies, copy .env.example to .env.local, configure the Gemini and Neon development-branch credentials, then run:

1. npm install
2. npm run db:migrate
3. npm run db:seed (development fixtures only)
4. npm run dev

Useful checks:

- npm run typecheck
- npm run lint
- npm test
- npm run build

Never commit secrets or expose server credentials through NEXT_PUBLIC variables.

## Data model and decisions

Request records, conversations, products, inventory, documents and vector chunks are stored in PostgreSQL. Each analysis starts a distinct conversation and is persisted with its original customer message. Catalog and stock outcomes are derived from database queries and deterministic application rules; the language model does not invent inventory availability.

Documents can be uploaded as TXT, MD, CSV, JSON, PDF or DOCX (maximum 10 MB). Extracted text is chunked and embedded for semantic retrieval. Product records can be created and stock quantities can be updated from the catalog workspace.

## Visual system

The application uses the Signal Ledger design system: graphite, cobalt and coral signal colors; Space Grotesk, DM Sans and IBM Plex Mono typography; sharp geometry; structured data tables; explicit decision states; and no preloaded sample requests. See DESIGN_SYSTEM.md for the complete design rules.

## Commercial readiness boundary

This repository now contains real persisted workflows rather than a static demo, but it is **not yet safe to expose publicly as a multi-customer SaaS**.

The current backend still uses a single WORKSPACE_ID and does not yet provide end-user authentication, workspace membership, role-based access control or tenant isolation. Several write-capable API routes therefore require access protection before public deployment. Rate limits, audit trails, operational alerts, end-to-end tests, backup/restore procedures and a customer onboarding/billing flow also remain launch requirements.

WORKSPACE_ID is a data-scope setting, not an authentication mechanism. Keep this deployment private until those controls are implemented.

Gemini extracts and interprets. Server-side code validates and decides. Human operators remain responsible for final commercial approval.
