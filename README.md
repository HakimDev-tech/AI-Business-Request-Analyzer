# Veyra — Commercial operations intelligence

A commercial workspace for processing B2B customer requests, matching products, checking inventory and retrieving internal commercial knowledge.

## Product workflows

- **Overview (/):** live request outcomes, attention queue, product count, available units and indexed-document metrics from PostgreSQL.
- **New analysis (/analyzer):** submit an original customer message, extract validated requirements, retrieve catalog context, check product availability and save a decision record.
- **Request history (/requests):** search and filter persisted analyses.
- **Request record (/requests/[id]):** inspect the source message, extracted fields, decision rationale, catalog matches, stock checks and retrieved evidence.
- **Catalog & inventory (/catalog):** create product records, set initial stock, update available quantities and manage knowledge documents.
- **Public product page (/product):** indexable product information, capability descriptions, FAQ and SoftwareApplication structured data.
- **Private access (/login):** shared workspace password with a signed, expiring, HTTP-only session cookie.

## Core stack

- Next.js App Router, React and TypeScript
- Tailwind CSS 4 and Lucide icons
- Gemini API for structured extraction and embeddings
- Zod for input/output validation
- Neon PostgreSQL with pgvector
- Server-side catalog and inventory tools

## Local setup

Use Node.js 22.x. Install dependencies, copy .env.example to .env.local, configure the Gemini and Neon development-branch credentials, configure workspace access, then run:

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

## Required environment variables

- GEMINI_API_KEY — server-side Gemini API key.
- DATABASE_URL — Neon connection string for the intended environment.
- WORKSPACE_ACCESS_PASSWORD — strong password for this private workspace instance.
- WORKSPACE_SESSION_SECRET — random secret of at least 32 characters used to sign session cookies.

Generate a session secret locally, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Set both workspace access variables in Vercel Environment Variables before deploying this version. Until they are configured, the workspace remains locked and the login page reports the missing configuration. Use different secrets for local development, preview and production. Do not paste the generated value into source control or public issues.
Environment-variable changes are applied to new Vercel deployments, not to already-running deployments. After adding or rotating workspace access secrets, trigger a new production deployment before attempting to sign in.

The current login is a **shared-password gate for a private single-workspace deployment**, not a user account system. It does not provide individual identities, password reset, organization membership, team roles or multi-tenant isolation. Restrict access at the deployment/network layer as an additional control.

## Data model and decisions

Request records, conversations, products, inventory, documents and vector chunks are stored in PostgreSQL. Each analysis starts a distinct conversation and is persisted with its original customer message. Catalog and stock outcomes are derived from database queries and deterministic application rules; the language model does not invent inventory availability.

Documents can be uploaded as TXT, MD, CSV, JSON, PDF or DOCX (maximum 10 MB). Extracted text is chunked and embedded for semantic retrieval. Product records can be created and stock quantities can be updated from the catalog workspace.

## Search and answer-engine discovery

The public product page is the only indexable product surface. It includes a canonical URL, Open Graph metadata, SoftwareApplication JSON-LD, a sitemap entry and crawler rules that keep application and API routes out of discovery. Configure APP_URL to the canonical public origin before launch. No private dashboard or customer data should be indexed.

## Visual system

The application uses Veyra Exchange Atelier: deep tidal teal, oxide, brass and mist surfaces; Newsreader, Manrope and IBM Plex Mono typography; an original route-line brand mark; asymmetrical component geometry; evidence-first data tables; and no preloaded sample requests. See DESIGN_SYSTEM.md for the complete design rules.

## Commercial readiness boundary

This repository now contains persisted operational workflows and a private access gate rather than a static demo. It is **not yet ready to be sold as a public multi-customer SaaS**.

The database still uses a single WORKSPACE_ID. Shared-password authentication does not provide end-user accounts, authorization roles, workspace membership or tenant isolation. Login rate limiting, audit logging, backups and restore tests, monitoring/alerting, end-to-end tests, customer onboarding, billing and support operations remain launch requirements.

WORKSPACE_ID is a data-scope setting, not an authentication mechanism. Keep the instance private until a real identity and tenant model has been implemented and tested.

Gemini extracts and interprets. Server-side code validates and decides. Human operators remain responsible for final commercial approval.
