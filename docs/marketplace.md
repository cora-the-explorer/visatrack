# VisaTrack Marketplace MVP

The marketplace turns VisaTrack into a two-sided platform: artists drop intake → AI builds a
dossier → vetted O-1B firms bid on the case → artist picks one and gets handed off.

This doc covers how to demo it, the flow itself, and where the code lives.

## Run it

```bash
pnpm install
pnpm dev
```

The first time you hit any URL, the file-backed store seeds itself with three approved firms
and five in-flight cases at various stages. Data lives at `apps/web/.data/marketplace.json` —
delete that file if you want to reset.

If you set `RESEND_API_KEY`, magic links and notifications go out via Resend. Otherwise they
console-log and append to `apps/web/logs/emails.jsonl` so you can still trace the flow. The
demo magic links also surface inline in the UI so you don't need to dig through logs.

## Demo URLs

- **Artist landing:** http://localhost:3000/
- **Firm landing:** http://localhost:3000/firms
- **Artist intake:** http://localhost:3000/intake
- **Firm sign-in:** http://localhost:3000/login?role=firm  (use one of the seeded firm emails: `sam@aperture-immigration.com`, `jen@northstarvisa.com`, `priya@midnightcounsel.com`)
- **Artist sign-in:** http://localhost:3000/login?role=artist  (use one of the seeded artist emails: `demo+kira@visatrack.test`, `demo+marco@visatrack.test`, …)

The "Send magic link" button shows the link inline in the demo so you can just click through.

## Artist flow

1. **`/`** — landing page, "Build my dossier" CTA.
2. **`/intake`** — 4 steps: identity → career → evidence URLs → proof of pay. The email is
   captured at step 1 and persisted (so we don't lose them if they bail).
3. **`/processing/[caseId]`** — animated console showing 21 mock agent steps (~10s). At the
   end, calls `POST /api/intake/[caseId]/finalize` which generates the deterministic mock
   evidence, scores it, and flips status to `dossier_ready`. Auto-redirects to the dossier.
4. **`/dossier/[caseId]`** — lite dossier with locked sections. CTA: "Get matched with a firm".
5. **`/match/[caseId]`** — target visa date, location, budget band, brief note. Submitting
   calls `POST /api/cases/[caseId]/list` which:
   - flips status to `listed`
   - emails every approved firm
   - issues an artist magic link (sent to email; also surfaced in the demo UI)
6. **`/portal`** — artist signed-in dashboard. Shows status, open bids count, dossier link,
   evidence score, and either a "next steps" panel (if matched) or a "still waiting" card.
7. **`/portal/bids`** — list of incoming bids (firm name, price, timeline, pitch excerpt).
8. **`/portal/bids/[bidId]`** — full bid: firm bio, specialties, fee philosophy, full pitch.
   Accept/Decline buttons. Acceptance:
   - flips that bid to `accepted`
   - declines all sibling pending bids
   - flips case to `matched`
   - creates a `handoff` row with `intro_sent_at`
   - emails both parties (intro)
9. **`/portal/dossier`** — read-only full dossier. Locked unless a bid is accepted.

## Firm flow

1. **`/firms`** — landing.
2. **`/firms/apply`** — short form (name, email, AILA, # cases last 12mo, website). Creates
   a pending firm row + a waitlist entry, emails an "application received" note.
3. **Admin approves manually**:
   ```bash
   curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
     http://localhost:3000/api/admin/firms/<firm-id>/approve
   ```
   Approval emails the firm a magic link.
4. **`/login?role=firm`** — magic-link sign-in.
5. **`/marketplace`** — firm home. Inbox of OPEN dossiers with anonymized stage name, genre,
   evidence score, criteria coverage, target date, location, budget. Cases the firm has
   already bid on are filtered out.
6. **`/marketplace/[caseId]`** — full dossier viewer (no locks; firms see everything). Right
   sidebar has firm-only notes (target date, location, budget, citizenship, brief) and the
   bid form: price, timeline weeks, pitch, optional sample URL.
7. **`/marketplace/sent`** — every bid this firm has submitted, with status (pending,
   accepted, declined).
8. **`/cases`** — kanban of cases this firm has WON. Stages: Engaged → Evidence in →
   Drafting → Review → Filed. Default lane is Engaged.
9. **`/cases/[caseId]`** — basic case detail with full dossier + artist contact info.
10. **`/settings`** — firm profile (display name, logo, bio, specialties, languages, fee
    philosophy). This is what artists see on the bid card.

## API surface

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/intake/start` | upsert artist + send magic link (step 1) |
| POST | `/api/intake/submit` | create case in `processing` |
| POST | `/api/intake/[caseId]/finalize` | generate mock evidence + flip to `dossier_ready` |
| POST | `/api/cases/[caseId]/list` | save matching prefs + flip to `listed` + notify firms |
| POST | `/api/cases/[caseId]/bids` | firm submits a bid (firm session required) |
| POST | `/api/bids/[bidId]/accept` | artist accepts (decline siblings, create handoff) |
| POST | `/api/bids/[bidId]/decline` | artist declines a single bid |
| POST | `/api/firms/apply` | firm applies for early access |
| POST | `/api/admin/firms/[id]/approve` | requires `Authorization: Bearer $ADMIN_TOKEN` |
| PATCH | `/api/firms/me` | firm updates its own profile |
| POST | `/api/auth/magic-link` | request a magic link (artist or firm) |
| GET  | `/api/auth/consume?token=…` | consume the link, set the cookie, redirect |
| GET/POST | `/api/auth/logout` | clear session cookie |

Sessions are cookie-based JSON blobs (`vt_session`). Middleware gates `/portal/*` (artist
only) and `/marketplace`, `/cases`, `/settings` (firm only).

## Data model

Drizzle schema for the new tables lives in `packages/db/src/schema.ts` (see
`artist_accounts`, `artist_cases`, `firm_profiles`, `firm_bids`, `magic_link_tokens`,
`handoffs`, `firm_waitlist`). Migration is generated at
`packages/db/drizzle/0000_*.sql`.

For demo purposes the app reads/writes a JSON file at `apps/web/.data/marketplace.json`
through `apps/web/src/lib/store.ts` — same shape as the Drizzle schema. Wiring the store to
real Postgres is straightforward when needed.

## Mock evidence

`apps/web/src/lib/mock-evidence.ts` is a deterministic generator seeded by case id. Same
case → same evidence on every render. It returns the structure consumed by
`DossierGrid` (`apps/web/src/components/marketplace/dossier-view.tsx`).

## What's intentionally not in scope

- No petition drafting, no document collection, no e-filing.
- No payment / escrow on accepted bids — the handoff is just an intro email.
- No real evidence scraping — the generator is mocked.
- No real auth provider; magic links are token-based with a cookie session.

## Reset / re-seed

```bash
rm apps/web/.data/marketplace.json apps/web/logs/emails.jsonl
# next request reseeds from src/lib/seed-data.ts
```

Or run the explicit seed script:

```bash
pnpm --filter @visa-track/db tsx src/seed-marketplace.ts
```
