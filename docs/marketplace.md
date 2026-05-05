# VisaTrack Marketplace MVP — v2 Claim Model

The marketplace turns VisaTrack into a petition pre-build platform: artists drop intake →
AI builds an 80%-complete petition draft + evidence dossier → vetted O-1B firms see a
curated inbox → first eligible firm **claims** the case for a flat unlock fee → firm
finishes and files inside the VisaTrack console.

> **v3.0 — May 2026:** Added the artist audit funnel in front of listing. Listing is still
> free, but it's now gated on a paid audit ($19 Standard / $49 Audit + Concierge). Free
> dossier preview replaces the v2 "free, immediate dossier"; preview locks after 48h.
> See [`audit-funnel.md`](audit-funnel.md) for the full flow + API surface. The firm side
> of the marketplace is unchanged — claim mechanics, unlock fees, and the 7-day engagement
> window all carry over.

> **v2.0 — May 2026:** Migrated from the original bid mechanic to the claim mechanic. Flat
> unlock fee, first-vetted-firm-wins, 7-day exclusive engagement window, no auctions, no
> losers, no fee splits. The legacy bid surface is preserved as an appendix at the bottom
> of this doc for historical reference.

This doc covers how to demo it, the flow itself, and where the code lives.

## Run it

```bash
pnpm install
pnpm dev
```

The first time you hit any URL, the file-backed store seeds itself with three approved firms
and five cases that exercise every claim state. Data lives at `apps/web/.data/marketplace.json` —
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
- **Artist firm view:** http://localhost:3000/portal/firm  (single chosen firm, replaces the v1 bid list)
- **Firm claim list:** http://localhost:3000/marketplace/claimed  (all your claims with countdown to engagement deadline)

The "Send magic link" button shows the link inline in the demo so you can just click through.

## Pricing

Flat unlock fee per case, keyed by evidence-quality band (computed from `evidenceScore`).
Sourced from `apps/web/src/lib/pricing.ts` (`PRICING.case_unlock_by_band`) so the firm
unlock fees and the artist audit prices share a single source of truth.

| Band | Score range | Unlock fee |
| --- | --- | --- |
| Low | < 80 | $300 |
| Medium | 80–89 | $400 |
| High | ≥ 90 | $500 |

Stripe wiring is Track B. For the demo, the fee is recorded on the claim row at claim time;
no actual charge is made.

### Listing is gated on an audit

A case can only be listed once the artist has purchased an audit and the audit hasn't
expired. `POST /api/cases/[caseId]/list` returns `402 Payment Required` with
`{ code: 'audit_required', auditEndpoint }` for any case whose status isn't `audited`
(or whose latest `artist_audits` row has passed `expiresAt`). The artist UI catches the
`/match` route at the layout level and redirects back to `/dossier/[caseId]?from=match` so
they never land on a dead-end form. Full flow + tiers in
[`audit-funnel.md`](audit-funnel.md).

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
   - emails every approved firm (with the unlock fee for this case)
   - issues an artist magic link (sent to email; also surfaced in the demo UI)
6. **`/portal`** — artist signed-in dashboard. Shows status, firm status (matched/engaged/
   awaiting/released), dossier link, evidence score, and countdown if there's an active claim.
7. **`/portal/firm`** — single chosen firm. Shows firm name, bio, specialties, fee philosophy,
   intro message. No accept/decline — the platform chose the firm by claim order. If no firm
   has claimed yet, shows the "still in marketplace" state.
8. **`/portal/dossier`** — read-only full dossier. Locked unless a claim is active or engaged.

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
   evidence score, criteria coverage, target date, location, budget, and the case's
   pricing band + unlock fee. Each card has a single **Claim ($XYZ)** button. Cases the firm
   has already claimed (or that are claimed by another firm) are filtered out.
6. **`/marketplace/[caseId]`** — full dossier viewer (no locks; firms see everything). Right
   sidebar has firm-only notes (target date, location, budget, citizenship, brief) and either
   the Claim card (price + 7-day window explainer) or, if already claimed, the artist contact.
7. **`/marketplace/claimed`** — every claim this firm has made, with status (active /
   engaged / released / closed) and days remaining in the engagement window. Shows the
   firm's score (engaged-within-window ratio).
8. **`/cases`** — kanban of cases this firm is currently working (active or engaged claims).
   Default lane is **Engaged**; later case-page transitions move things along.
9. **`/cases/[caseId]`** — full dossier + artist contact + engagement panel. While the
   claim is `active`, shows a **Log first engagement** button. After 7 days without
   engagement, the in-process tick auto-releases the claim.
10. **`/settings`** — firm profile (display name, logo, bio, specialties, languages, fee
    philosophy). This is what artists see when their case gets claimed.

## API surface

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/intake/start` | upsert artist + send magic link (step 1) |
| POST | `/api/intake/submit` | create case in `processing` |
| POST | `/api/intake/[caseId]/finalize` | generate mock evidence + flip to `dossier_ready` |
| POST | `/api/cases/[caseId]/list` | save matching prefs + flip to `listed` + notify firms. **402 audit_required** if the case has not been audited or the audit expired. |
| POST | `/api/cases/[caseId]/audit` | v3 audit funnel — body `{ tier }`. See [audit-funnel.md](audit-funnel.md). |
| POST | `/api/cases/[caseId]/addon` | v3 audit funnel — body `{ kind }`. |
| POST | `/api/cases/[caseId]/claim` | firm claims the case (firm session required) |
| POST | `/api/claims/[claimId]/log-engagement` | firm logs first contact with artist |
| POST | `/api/claims/[claimId]/release` | admin-only release of an active claim |
| POST | `/api/firms/apply` | firm applies for early access |
| POST | `/api/admin/firms/[id]/approve` | requires `Authorization: Bearer $ADMIN_TOKEN` |
| PATCH | `/api/firms/me` | firm updates its own profile |
| POST | `/api/auth/magic-link` | request a magic link (artist or firm) |
| GET  | `/api/auth/consume?token=…` | consume the link, set the cookie, redirect |
| GET/POST | `/api/auth/logout` | clear session cookie |
| POST | `/api/cases/[caseId]/bids` | **410 Gone** — see `/claim` (DEPRECATED — v1 bid model) |
| POST | `/api/bids/[bidId]/accept` | **410 Gone** — no replacement (DEPRECATED — v1) |
| POST | `/api/bids/[bidId]/decline` | **410 Gone** — no replacement (DEPRECATED — v1) |

Sessions are cookie-based JSON blobs (`vt_session`). Middleware gates `/portal/*` (artist
only) and `/marketplace`, `/cases`, `/settings` (firm only).

## Auto-release

There is no Trigger.dev worker in the demo. Instead, on every `store.all()` read (throttled
to once per minute) the in-process tick scans claims with `status = active` whose
`claimedAt + 7 days` has elapsed without an `engagedAt` value. Those claims flip to
`released`, the case status flips back to `released_back`, and the firm's score is recomputed
(demerit). Track B replaces this with Trigger.dev.

## Data model

Drizzle schema lives in `packages/db/src/schema.ts`. The v2 claim tables are:

- `firm_claims` — `id`, `case_id`, `firm_id`, `unlock_fee_cents`, `status`
  (`active | engaged | released | closed`), `claimed_at`, `engaged_at`, `released_at`,
  `release_reason`. (Stripe charge id will live alongside `unlock_fee_cents` in Track B.)
- `case_pricing` — `band` (`low | medium | high`) → `unlock_fee_cents`. Demo seeds
  $300 / $400 / $500.
- `firm_scores` — `firm_id`, `claims_total`, `engaged_within_window`, `score` (0–100).
  Recomputed from claim history.
- `artist_cases.status` — extended with `claimed` and `released_back`.
- `firm_bids` — **DEPRECATED — v2 claim model**. Kept in place behind a feature flag for
  one release. Drop in a later migration.
- `handoffs.claim_id` — v2 reference; `handoffs.accepted_bid_id` is **DEPRECATED**.

For demo purposes the app reads/writes a JSON file at `apps/web/.data/marketplace.json`
through `apps/web/src/lib/store.ts` — same shape pattern. Wiring the store to real Postgres
is straightforward when needed.

## Mock evidence

`apps/web/src/lib/mock-evidence.ts` is a deterministic generator seeded by case id. Same
case → same evidence on every render. It returns the structure consumed by
`DossierGrid` (`apps/web/src/components/marketplace/dossier-view.tsx`).

## What's intentionally not in scope

- No petition drafting, no document collection, no e-filing.
- No Stripe integration on claim — `unlockFeeCents` is recorded but no charge is made.
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

The seed produces:

- 3 approved firms (Aperture, North Star, Midnight Counsel)
- 1 case with an **active** claim by Aperture (in 7-day window)
- 1 case **listed** in the pool waiting for a claim
- 1 case **dossier_ready** (pre-list)
- 1 case **engaged** by Midnight Counsel (claimed + first contact logged)
- 1 case **released_back** after Aperture/North Star let the window expire

---

## Appendix — v1 Bid Model (DEPRECATED, kept for reference)

The original demo used a **bid** mechanic. Firms posted competing bids (price + timeline +
pitch); artists accepted one and declined the rest. This model was retired in v2 because:

1. **Auction churn** — firms that bid and lost churned off the platform.
2. **Trust gap** — firms wouldn't bid blind on case quality without seeing the dossier first.
3. **Fee-split optics** — variable bid pricing read like a referral commission to state
   bar regulators in TX/NY/CA.

The v2 claim model replaces all three with a flat unlock fee, first-vetted-firm-wins, and
no losers. The v1 bid endpoints (`POST /api/cases/[caseId]/bids`, `POST /api/bids/[bidId]/accept`,
`POST /api/bids/[bidId]/decline`) now return **410 Gone** with a migration note pointing at
the claim equivalents. The `firm_bids` table and `FirmBid` type are still defined behind a
feature flag for one release so historical data continues to read; they will be dropped in a
later migration.

### Migration order (already shipped)

1. Add `firm_claims` table + `case_pricing` + `firm_scores` alongside existing bid tables ✓
2. Add `/api/cases/[caseId]/claim` ✓ (Stripe wiring deferred to Track B)
3. Build new firm `/marketplace` card UI with Claim button ✓
4. Build new artist `/portal/firm` view ✓
5. Cut over `/marketplace/sent` → `/marketplace/claimed`, `/portal/bids` → `/portal/firm` ✓
6. Replace bid API endpoints with 410 Gone responses ✓
7. Drop legacy `firm_bids` table — **deferred to a later migration**

### Old v1 surface (for reference)

The legacy artist flow had:

- `/portal/bids` — list of incoming bids with firm name, price, timeline, pitch excerpt
- `/portal/bids/[bidId]` — bid detail with accept/decline buttons. Acceptance flipped that
  bid to `accepted`, declined siblings, flipped case to `matched`, and created a handoff.

Both routes now redirect to `/portal/firm`.

The legacy firm flow had `/marketplace/sent` (now redirects to `/marketplace/claimed`) and a
`BidForm` sidebar on `/marketplace/[caseId]` (replaced with the Claim card).
