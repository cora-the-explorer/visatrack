-- visatrack initial schema (login-based scraping, no Meta OAuth)
-- Mirrors db/schema.ts. Apply via:
--   psql "$DATABASE_URL" -f db/migrations/0001_init.sql
-- (or `pnpm drizzle-kit push` once DATABASE_URL is set)

DO $$ BEGIN
    CREATE TYPE "vt_tier" AS ENUM ('lite', 'standard', 'full');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "vt_lead_status" AS ENUM ('new', 'scanning', 'scored', 'error', 'paid', 'claimed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "vt_platform" AS ENUM ('instagram', 'tiktok', 'youtube', 'press');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "vt_leads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "ig_handle" text NOT NULL,
    "email" text,
    "tier" "vt_tier" NOT NULL DEFAULT 'lite',
    "status" "vt_lead_status" NOT NULL DEFAULT 'new',
    "evidence_score" integer,
    "gap_summary" jsonb,
    "claimed_by_firm_id" uuid,
    "error_message" text
);

CREATE INDEX IF NOT EXISTS "vt_leads_created_idx" ON "vt_leads" ("created_at");
CREATE INDEX IF NOT EXISTS "vt_leads_status_idx" ON "vt_leads" ("status");
CREATE INDEX IF NOT EXISTS "vt_leads_handle_idx" ON "vt_leads" ("ig_handle");

CREATE TABLE IF NOT EXISTS "vt_evidence_scans" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "lead_id" uuid NOT NULL REFERENCES "vt_leads"("id") ON DELETE CASCADE,
    "platform" "vt_platform" NOT NULL,
    "raw_payload" jsonb,
    "normalized" jsonb,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "vt_scans_lead_idx" ON "vt_evidence_scans" ("lead_id");
CREATE INDEX IF NOT EXISTS "vt_scans_platform_idx" ON "vt_evidence_scans" ("platform");
