# VisaTrack Artist Audit Funnel — v3

The audit funnel replaces the v1/v2 "free, immediate dossier" experience with
a **free preview → paid audit → free listing** flow. Listing in the
marketplace is still free — the audit is the toll. Once audited, the firm
side is unchanged: vetted firms see the inbox, the first eligible firm to
claim wins a 7-day exclusive engagement window for the flat unlock fee.

> **Track A demo posture:** all prices are recorded on rows, no Stripe is
> wired. The demo runs out of the file-backed store at
> `apps/web/.data/marketplace.json`. Stripe (and Trigger.dev for the
> background tick) move to Track B.

See [`visatrack-pricing-model.md`](../../.openclaw/workspace/visatrack-pricing-model.md)
§2 + §7 + §9 for the model rationale (free intake non-negotiable; audit before
listing; flat fees, never commissions).

## Status flow

```
intake
  → processing
  → dossier_preview        (default after evidence assembly; 48h window)
       ├─ purchase audit → audited
       └─ 48h elapsed     → audit_expired
  audited                  (90-day window)
       ├─ list             → listed → claimed → ...
       └─ 90d elapsed      → audit_expired
  audit_expired
       └─ purchase re-audit → audited (fresh 90-day window)
```

`dossier_ready` is retained in the enum behind a backward-compat read for
older rows. New finalize calls land on `dossier_preview` instead.

## Pricing

All prices live in `apps/web/src/lib/pricing.ts` (cents). The firm
marketplace's `case_pricing` reads from the same `PRICING.case_unlock_by_band`
so prices stay in sync.

| Stream | Item | Price |
| --- | --- | --- |
| Audit | Standard | $19 |
| Audit | Audit + Concierge | $49 |
| Add-on | Manager Kit | $19 |
| Add-on | Express Evidence (24h) | $29 |
| Add-on | Re-list Boost (post auto-release) | $29 |
| Add-on | Re-audit (after expiry) | $9 |
| Case unlock (firm) | Low / Medium / High band | $300 / $400 / $500 |

## Free preview — what artists see without paying

| Element | Visible | Locked |
| --- | --- | --- |
| Quality | "Strong / Moderate / Needs Work" badge | Numerical score (0–100) |
| Exhibits | Counts ("47 press mentions across 12 outlets") | Sources, screenshots, full extracts |
| Criteria | Filled/empty bars per O-1B criterion | Names of weak criteria + reasons |
| Recommendations | Locked teaser | The actual 3 recommendations |
| Window | 48h countdown | After 48h: re-locks → audit_expired |

## Audited dossier — what unlocks at $19

- Numerical evidence score (0–100) with criterion breakdown
- All exhibits unlocked: sources, screenshots, full extracts
- 3 specific recommendations tied to evidence findings
- USCIS RFE risk flag (when score < 80)
- Listing eligibility (the `/api/cases/:id/list` 402 gate clears)
- 90-day audit validity window

## Audit + Concierge — what's added at $49

- Everything in Standard
- 20-minute concierge call (Cal.com stub in demo, Track B wires real)
- Custom recommendation letter template
- Priority badge in firm marketplace inbox for 7 days
- Skip-the-line on first 3 firm claims

## API surface

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/cases/[caseId]/audit` | body: `{ tier: 'standard' \| 'concierge' }` — flips dossier_preview/expired → audited and creates `artist_audits` row |
| POST | `/api/cases/[caseId]/addon` | body: `{ kind: 'manager_kit' \| 'express_evidence' \| 'relist_boost' \| 're_audit' }` — records a purchase; `re_audit` also regenerates evidence and refreshes the 90-day window |
| POST | `/api/cases/[caseId]/list` | **Now gated**: returns 402 with `{ code: 'audit_required', auditEndpoint }` unless `status === 'audited'` and the audit hasn't expired |
| POST | `/api/intake/[caseId]/finalize` | **Now lands on `dossier_preview`** instead of the legacy `dossier_ready` |

402 response shape:

```json
{
  "error": "Listing requires a paid audit. POST /api/cases/:id/audit first.",
  "code": "audit_required",
  "auditEndpoint": "/api/cases/<id>/audit"
}
```

## Demo URLs

```bash
pnpm dev
```

The store auto-seeds 3 firms + 10 cases (every audit + claim state):

| Case | Status | Notes |
| --- | --- | --- |
| `c11..` (KIRA TNK) | claimed | Active claim by Aperture, 7-day window. Has Standard audit. |
| `c22..` (CIUDAD) | listed | In pool waiting for a firm. Has Standard audit. |
| `c33..` (ame.studio) | dossier_preview | Mid-window preview, audit not yet purchased. |
| `c44..` (LEONI) | claimed (engaged) | Concierge-tier audit, firm has logged engagement. |
| `c55..` (NIA·P) | released_back | Standard audit, prior firm let window expire. |
| `c66..` (HOSHi) | dossier_preview | Fresh preview (~47h remaining). |
| `c77..` (RAFA·M) | dossier_preview | Preview about to expire (~2h remaining). |
| `c88..` (V Λ R) | audit_expired | Re-audit ($9) re-opens. |
| `c99..` (WEi.) | audited (Standard) | Just audited, full 90-day window. |
| `cccc..` (ISLA) | audited (Concierge) | Concierge tier + Manager Kit add-on already purchased. |

To exercise the flow end-to-end:

1. Open `http://localhost:3000/dossier/c33333333-3333-4333-8333-333333333333`
   → preview view with locked exhibits + countdown.
2. Click **Standard Audit — $19** → flips to audited; full dossier renders.
3. Click **Get matched with a firm →** → /match opens (status=audited passes
   the layout guard).
4. Listing posts to `/api/cases/:id/list`, which now succeeds and emails the
   firms.

## Background tick

The same throttled (1/min) in-process tick that auto-releases stale claims
also handles audit lifecycle:

- `dossier_preview` whose `createdAt + 48h` has elapsed → `audit_expired`.
- `audited` whose latest non-refunded `artist_audits.expiresAt` has passed →
  `audit_expired`.

Track B replaces this with a Trigger.dev cron, just like auto-release.

## Re-audit semantics

`re_audit` is the only add-on with side effects beyond a row write:

- Regenerates evidence via `generateEvidence(caseId, …)` and re-scores it
- Status flips back to `audited`
- A new `artist_audits` row is written so the 90-day window restarts
- The previous (expired) audit row is left in place for history

This mirrors the §2.4 pricing-model intent: re-audit lets artists pick up
new press / chart placements that landed since the last audit, without
re-running intake.

## What's intentionally not in scope (Track A)

- No Stripe charges — every endpoint records `priceCents` and moves on.
- No real concierge scheduling — the button alerts a stub.
- No email throttling on audit notifications — every purchase fires once.
- No volume discount on add-ons — the artist side stays one-shot per case.
- No Vault subscription (Stream 4) — activates after first cohort of
  approved cases (Month 9+).

## Reset / re-seed

```bash
rm apps/web/.data/marketplace.json apps/web/logs/emails.jsonl
# next request reseeds from src/lib/seed-data.ts
```
