# visatrack — artist-facing landing site

Next.js 15 app at port **3001** (apps/web is 3000). Hormozi-style funnel for DJs, creators,
and influencers chasing an O-1 visa.

## What this app does

1. Public landing page with hero CTA: artist enters their `@handle`.
2. POST `/api/scan/start` creates a `vt_leads` row (status=`scanning`) and kicks off a scrape.
3. Server logs into Instagram as a dedicated scraper account (Playwright headless),
   pulls the artist's public profile + first ~12 posts via `/api/v1/users/web_profile_info`.
4. Captions are classified against the 8 USCIS O-1 criteria via keyword heuristics.
5. The frontend polls `/api/scan/status?lead_id=…` every 2s. When `status=scored`,
   `/scan/[lead_id]` renders the score + scorecard + upgrade CTA.

> No Meta Graph API, no IG OAuth. Login-based scraping with `proper.selects`.
> See [Known limitations](#known-limitations) before scaling.

## Env vars

`.env.local` (already created, gitignored):

| Var                            | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Anon key for browser reads                                   |
| `SUPABASE_SERVICE_ROLE_KEY`    | Server-only key — used by `/api/*` routes                    |
| `DATABASE_URL`                 | Postgres connection (pooler) — for Drizzle Kit pushes        |
| `DIRECT_URL`                   | Postgres direct connection — for `psql` migration apply      |
| `IG_SCRAPER_USERNAME`          | Instagram scraper account login                              |
| `IG_SCRAPER_PASSWORD`          | Instagram scraper account password                           |
| `NEXT_PUBLIC_APP_URL`          | Public origin (e.g. `http://localhost:3001`)                 |
| `NEXT_PUBLIC_FIRM_CONSOLE_URL` | Origin of the firm-console app (optional)                    |

## Run it

```bash
# from monorepo root
pnpm install --filter visatrack

# install Playwright Chromium (one-time, ~250MB)
cd apps/visatrack
pnpm exec playwright install chromium

# (re-)apply schema if you have a fresh DB
psql "$DIRECT_URL" -f db/migrations/0001_init.sql
# or, equivalently:
pnpm db:push

# dev server
pnpm dev
# -> http://localhost:3001
```

## Routes

| Route                          | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `GET /`                        | Landing page                                                 |
| `POST /api/scan/start`         | Create lead + kick scrape. Body: `{ ig_handle, email? }`     |
| `POST /api/scan/run`           | Internal — runs the scrape. Body: `{ lead_id }`              |
| `GET  /api/scan/status`        | Poll endpoint. Query: `?lead_id=…`                           |
| `GET  /scan/[lead_id]`         | Results page — polls and renders score + scorecard           |

## Database

`db/schema.ts` (Drizzle). Tables:

- `vt_leads` — every artist who ran the scan
- `vt_evidence_scans` — raw + normalized scrape per platform per lead

Apply with `pnpm db:push` (or `psql -f db/migrations/0001_init.sql`).

## Scraper internals

`lib/scraper/instagram.ts`:

- Singleton headless Chromium browser + persisted `BrowserContext`.
- On first use, navigates to `/accounts/login/`, fills username/password, dismisses
  "Save your login info" interstitial, persists cookies to `.scraper-state/instagram.json`.
- Each call: navigates to `https://www.instagram.com/{handle}/`, then `page.evaluate()`s
  `fetch('/api/v1/users/web_profile_info/?username=…')` with `x-ig-app-id` header.
- Errors mapped to `InstagramScraperError.code`:
  `account_not_found | account_private | login_required | rate_limited | login_failed | parse_failed | unknown`.
- On `login_required`, performs a fresh login and retries once.

## Known limitations

- **Rate limits.** IG aggressively throttles repeat web scrapes. A single scraper
  account will start hitting `429`s after a few dozen hits per hour. Production needs
  a rotation of accounts behind a proxy pool (or a real IG affiliate API).
- **Account ban risk.** The scraper account can be flagged/disabled. Cookies persist
  in `.scraper-state/`, but a fresh checkpoint/2FA challenge will hard-fail until
  someone logs in manually. Plan for `login_failed` in production monitoring.
- **Login-info popup.** IG ships intermittent post-login interstitials
  ("Save your login info?", "Turn on notifications?"). The scraper handles the most
  common ones — new variants may slip through. Watch for `login_failed` with `challenge`
  in the error message.
- **Public profiles only.** Private accounts return their bio + counts but no posts.
- **Heuristic scoring.** Caption classification is keyword-regex. Replace with an LLM
  classifier (Claude Haiku or similar) for v2 — current false-positive rate is non-trivial.
- **No Stripe yet.** The "Upgrade to Standard" button shows an alert. Wire Stripe in v2.

## MVP status

| Feature                              | Status |
| ------------------------------------ | ------ |
| Landing page (Hormozi copy, sections)| ✅     |
| Free scan flow (handle → result)     | ✅     |
| Supabase persistence                 | ✅     |
| IG login-based scrape                | ✅     |
| 8-criterion scorecard                | ✅     |
| Multi-platform scrape (TikTok/YT)    | ❌ v2  |
| Press search                         | ❌ v2  |
| Stripe checkout                      | ❌ v2  |
| Firm-console claim API               | ❌ v2  |
