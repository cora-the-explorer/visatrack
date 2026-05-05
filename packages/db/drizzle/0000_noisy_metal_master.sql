CREATE TYPE "public"."agent_name" AS ENUM('intake', 'evidence_curator', 'expert_letter_drafter', 'petition_drafter', 'rfe_responder', 'qa_reviewer');--> statement-breakpoint
CREATE TYPE "public"."agent_status" AS ENUM('queued', 'running', 'awaiting_gate', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."artist_case_status" AS ENUM('intake', 'processing', 'dossier_ready', 'listed', 'matched', 'closed');--> statement-breakpoint
CREATE TYPE "public"."bid_status" AS ENUM('pending', 'accepted', 'declined', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."case_status" AS ENUM('intake', 'evidence', 'drafting', 'review', 'filed', 'approved', 'denied', 'rfe', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('petition_letter', 'expert_letter', 'form_i129', 'exhibit', 'cover', 'other');--> statement-breakpoint
CREATE TYPE "public"."evidence_category" AS ENUM('awards', 'press', 'judging', 'original_contributions', 'authorship', 'leading_role', 'high_salary', 'commercial_success', 'memberships', 'other');--> statement-breakpoint
CREATE TYPE "public"."evidence_status" AS ENUM('proposed', 'accepted', 'rejected', 'needs_review');--> statement-breakpoint
CREATE TYPE "public"."firm_status" AS ENUM('pending', 'approved', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."gate_action_type" AS ENUM('approve', 'reject', 'edit', 'escalate');--> statement-breakpoint
CREATE TYPE "public"."magic_link_role" AS ENUM('artist', 'firm', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'attorney', 'paralegal', 'analyst', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."visa_type" AS ENUM('O-1B', 'P-1B', 'O-2', 'P-1S');--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"case_id" uuid,
	"agent" "agent_name" NOT NULL,
	"status" "agent_status" DEFAULT 'queued' NOT NULL,
	"triggered_by_user_id" uuid,
	"trigger_job_id" text,
	"input" jsonb,
	"output" jsonb,
	"error" text,
	"token_usage" jsonb,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artist_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"legal_name" text,
	"stage_name" text,
	"phone" text,
	"citizenship" text,
	"based_in" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artist_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "artist_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"visa_type" text DEFAULT 'O-1B' NOT NULL,
	"intake_data" jsonb,
	"evidence_data" jsonb,
	"evidence_score" integer,
	"criteria_coverage" jsonb,
	"status" "artist_case_status" DEFAULT 'intake' NOT NULL,
	"target_visa_date" timestamp,
	"location" text,
	"budget_band" text,
	"brief_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"legal_name" text NOT NULL,
	"stage_name" text,
	"nationality" varchar(3),
	"dob" timestamp,
	"field" text,
	"bio" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"actor_agent_run_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid,
	"diff" jsonb,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"artist_id" uuid,
	"sponsor_id" uuid,
	"lead_attorney_id" uuid,
	"paralegal_id" uuid,
	"visa_type" "visa_type" DEFAULT 'O-1B' NOT NULL,
	"status" "case_status" DEFAULT 'intake' NOT NULL,
	"title" text NOT NULL,
	"receipt_number" text,
	"priority_date" timestamp,
	"target_filing_date" timestamp,
	"filed_at" timestamp with time zone,
	"decided_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"case_id" uuid,
	"kind" "document_kind" NOT NULL,
	"title" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"page_count" integer,
	"version" integer DEFAULT 1 NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_by_user_id" uuid,
	"created_by_agent_run_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"category" "evidence_category" NOT NULL,
	"status" "evidence_status" DEFAULT 'proposed' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"source_url" text,
	"source_document_id" uuid,
	"proposed_by_agent_run_id" uuid,
	"decided_by_user_id" uuid,
	"decided_at" timestamp with time zone,
	"rejection_reason" text,
	"strength" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "firm_bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"firm_id" uuid NOT NULL,
	"price_cents" integer NOT NULL,
	"timeline_weeks" integer NOT NULL,
	"pitch" text NOT NULL,
	"sample_url" text,
	"status" "bid_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "firm_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"display_name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"logo_url" text,
	"bio" text,
	"specialties" jsonb,
	"languages" jsonb,
	"fee_philosophy" text,
	"cases_handled" integer DEFAULT 0 NOT NULL,
	"status" "firm_status" DEFAULT 'pending' NOT NULL,
	"aila_member" boolean DEFAULT false NOT NULL,
	"contact_email" text NOT NULL,
	"contact_name" text,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	CONSTRAINT "firm_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "firm_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_name" text NOT NULL,
	"contact_name" text,
	"contact_email" text NOT NULL,
	"website" text,
	"aila_member" boolean DEFAULT false NOT NULL,
	"cases_last_12mo" integer,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "firm_status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gate_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"agent_run_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"action" "gate_action_type" NOT NULL,
	"notes" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "handoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"firm_id" uuid NOT NULL,
	"accepted_bid_id" uuid NOT NULL,
	"intro_sent_at" timestamp with time zone,
	"retainer_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "magic_link_role" NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_link_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "rag_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer,
	"embedding" vector(1024),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rag_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"case_id" uuid,
	"source_type" text NOT NULL,
	"source_uri" text,
	"title" text,
	"content_hash" varchar(64),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"fein" varchar(16),
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" varchar(2),
	"postal_code" varchar(16),
	"country" varchar(3) DEFAULT 'USA',
	"contact_email" text,
	"contact_phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"workos_org_id" text,
	"branding" jsonb,
	"settings" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_workos_org_id_unique" UNIQUE("workos_org_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workos_user_id" text,
	"email" text NOT NULL,
	"full_name" text,
	"role" "user_role" DEFAULT 'paralegal' NOT NULL,
	"bar_number" text,
	"bar_state" varchar(2),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_workos_user_id_unique" UNIQUE("workos_user_id")
);
--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_cases" ADD CONSTRAINT "artist_cases_artist_id_artist_accounts_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_lead_attorney_id_users_id_fk" FOREIGN KEY ("lead_attorney_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_paralegal_id_users_id_fk" FOREIGN KEY ("paralegal_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_items" ADD CONSTRAINT "evidence_items_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_bids" ADD CONSTRAINT "firm_bids_case_id_artist_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."artist_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_bids" ADD CONSTRAINT "firm_bids_firm_id_firm_profiles_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firm_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_profiles" ADD CONSTRAINT "firm_profiles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_actions" ADD CONSTRAINT "gate_actions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_actions" ADD CONSTRAINT "gate_actions_agent_run_id_agent_runs_id_fk" FOREIGN KEY ("agent_run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_actions" ADD CONSTRAINT "gate_actions_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_case_id_artist_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."artist_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_firm_id_firm_profiles_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firm_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handoffs" ADD CONSTRAINT "handoffs_accepted_bid_id_firm_bids_id_fk" FOREIGN KEY ("accepted_bid_id") REFERENCES "public"."firm_bids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_chunks" ADD CONSTRAINT "rag_chunks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_chunks" ADD CONSTRAINT "rag_chunks_document_id_rag_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."rag_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD CONSTRAINT "rag_documents_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_runs_tenant_idx" ON "agent_runs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "agent_runs_case_idx" ON "agent_runs" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "agent_runs_status_idx" ON "agent_runs" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "artist_accounts_email_idx" ON "artist_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "artist_cases_artist_idx" ON "artist_cases" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "artist_cases_status_idx" ON "artist_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "artists_tenant_idx" ON "artists" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_tenant_idx" ON "audit_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_resource_idx" ON "audit_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "cases_tenant_idx" ON "cases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cases_status_idx" ON "cases" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "cases_artist_idx" ON "cases" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "documents_tenant_case_idx" ON "documents" USING btree ("tenant_id","case_id");--> statement-breakpoint
CREATE INDEX "documents_kind_idx" ON "documents" USING btree ("case_id","kind");--> statement-breakpoint
CREATE INDEX "evidence_tenant_case_idx" ON "evidence_items" USING btree ("tenant_id","case_id");--> statement-breakpoint
CREATE INDEX "evidence_status_idx" ON "evidence_items" USING btree ("case_id","status");--> statement-breakpoint
CREATE INDEX "firm_bids_case_idx" ON "firm_bids" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "firm_bids_firm_idx" ON "firm_bids" USING btree ("firm_id");--> statement-breakpoint
CREATE INDEX "firm_bids_status_idx" ON "firm_bids" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_profiles_status_idx" ON "firm_profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "firm_profiles_email_idx" ON "firm_profiles" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "firm_waitlist_email_idx" ON "firm_waitlist" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "gate_actions_tenant_idx" ON "gate_actions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "gate_actions_run_idx" ON "gate_actions" USING btree ("agent_run_id");--> statement-breakpoint
CREATE INDEX "handoffs_case_idx" ON "handoffs" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "handoffs_firm_idx" ON "handoffs" USING btree ("firm_id");--> statement-breakpoint
CREATE INDEX "magic_link_email_idx" ON "magic_link_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "magic_link_token_idx" ON "magic_link_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "rag_chunks_tenant_idx" ON "rag_chunks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "rag_chunks_doc_idx" ON "rag_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "rag_chunks_embedding_idx" ON "rag_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "rag_docs_tenant_idx" ON "rag_documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "rag_docs_case_idx" ON "rag_documents" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "rag_docs_hash_idx" ON "rag_documents" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "sponsors_tenant_idx" ON "sponsors" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");