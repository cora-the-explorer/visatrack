# VisaTrack — Pre-Built Petition Platform

**One sentence:** We build O-1B / P-1B petitions to 80% complete, then hand them to vetted immigration firms who finalize and file.

A petition pre-build platform with a built-in firm network. Artists submit intake → AI gathers evidence + drafts petition → vetted firms claim cases for a flat unlock fee → firms finish and file inside the VisaTrack console.

**Not** a lead marketplace. **Not** an auction. **Not** fee-split. See [visatrack-whitepaper.md](../../.openclaw/workspace/visatrack-whitepaper.md) for the full model.

## Revenue Streams

1. **Case unlock** — $300–500/case (firm pays for exclusive 7-day claim window)
2. **SaaS console** — $200–400/mo (firms keep using it post-claim to file & track)
3. **Artist concierge** — $99–299 (optional; priority + expedited evidence pulls)

## Stack

- **Frontend:** Next.js 15 (App Router, RSC) · React 19 · Tailwind · shadcn/ui · Zustand · TanStack Query
- **API:** Hono + tRPC · Zod
- **Data:** Drizzle ORM · Neon Postgres · pgvector · Voyage AI embeddings
- **Auth:** WorkOS (SSO + RBAC)
- **Agents:** LangGraph subgraphs · Trigger.dev workers
- **Observability:** OpenTelemetry · Sentry · Axiom
- **Infra:** Pulumi

## Layout

```
apps/
  web/          Next.js 15 firm console
  workers/      Trigger.dev tasks (agents)
packages/
  db/           Drizzle schema + migrations
  auth/         WorkOS + RBAC helpers
  agents/       LangGraph subgraphs per agent
  rag/          Voyage AI + pgvector helpers
  ui/           shadcn/ui + brand tokens
  api-types/    Zod-derived shared types
  observability/ OTel + Sentry + Axiom wrappers
infra/pulumi/
tests/{e2e,isolation,evals}/
```

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Scripts

- `pnpm dev` — start the web app
- `pnpm build` — build all packages
- `pnpm typecheck` — typecheck all packages
- `pnpm db:generate` — generate Drizzle migrations
- `pnpm db:migrate` — apply migrations
- `pnpm db:studio` — open Drizzle Studio

## Demo MVP (Track A)

The current demo runs the end-to-end flow: artists upload intake → AI builds a dossier
→ vetted O-1B firms see the inbox → first eligible firm claims for a flat unlock fee →
7-day exclusive engagement → handoff. See
**[docs/marketplace.md](docs/marketplace.md)** for the full flow, demo URLs, and API surface.

> **v2.0 (May 2026) shipped.** The demo now uses the **claim** mechanic — flat unlock fee
> per evidence-quality band ($300 / $400 / $500), first vetted firm wins exclusive 7-day
> engagement, no auctions, no losers. The legacy bid endpoints return 410 Gone; see
> `docs/marketplace.md` for the appendix on the retired v1 bid model.

```bash
pnpm dev
# Artists:  http://localhost:3000/
# Firms:    http://localhost:3000/firms
```

The app auto-seeds 3 firms + 5 cases on first request (active claim, listed pool, dossier
ready, engaged, released-back — every claim state). No DB required to run the demo —
data lives at `apps/web/.data/marketplace.json` (delete to reset).
