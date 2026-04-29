# SpinVisa architecture

## High-level

```
                  ┌──────────────┐
   browser ──▶    │  Next.js 15  │ ◀── RSC + tRPC + Hono
                  │  (apps/web)  │
                  └──────┬───────┘
                         │
                ┌────────┴─────────┐
                ▼                  ▼
     ┌──────────────────┐    ┌──────────────┐
     │  Neon Postgres   │    │ Trigger.dev  │
     │  + pgvector      │    │  workers     │
     └────────┬─────────┘    └──────┬───────┘
              │                     │
              ▼                     ▼
       ┌──────────────────────────────────┐
       │ LangGraph agents · Anthropic API │
       │ Voyage AI embeddings             │
       └──────────────────────────────────┘
```

## Multi-tenancy

Every row carries `tenant_id`. Every API call resolves a `Session { tenantId, role }` from
the WorkOS cookie before dispatch; query helpers always include `tenantId` in `WHERE`.

## Agents

LangGraph subgraphs in `packages/agents`. Triggered from the web app via Trigger.dev,
which writes back through Hono webhooks (`/api/hono/agents/callback`). Long-running runs
park in `awaiting_gate` for attorney review in `/inbox`.

## RAG

Documents → chunked → Voyage `voyage-3-large` (1024-d) → pgvector cosine search,
scoped by `tenant_id`. Tenant isolation tests in `tests/isolation`.
