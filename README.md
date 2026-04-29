# SpinVisa Firm Console

Multi-tenant SaaS for immigration law firms to manage O-1B / P-1B visa cases end-to-end.

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
