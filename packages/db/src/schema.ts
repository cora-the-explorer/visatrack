// Visa Track core schema — multi-tenant.
// pgvector extension required: `CREATE EXTENSION IF NOT EXISTS vector;`
import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from 'drizzle-orm/pg-core';

// -- Enums -----------------------------------------------------------------

export const visaTypeEnum = pgEnum('visa_type', ['O-1B', 'P-1B', 'O-2', 'P-1S']);

export const caseStatusEnum = pgEnum('case_status', [
  'intake',
  'evidence',
  'drafting',
  'review',
  'filed',
  'approved',
  'denied',
  'rfe',
  'withdrawn',
]);

export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'attorney',
  'paralegal',
  'analyst',
  'viewer',
]);

export const evidenceCategoryEnum = pgEnum('evidence_category', [
  'awards',
  'press',
  'judging',
  'original_contributions',
  'authorship',
  'leading_role',
  'high_salary',
  'commercial_success',
  'memberships',
  'other',
]);

export const evidenceStatusEnum = pgEnum('evidence_status', [
  'proposed',
  'accepted',
  'rejected',
  'needs_review',
]);

export const documentKindEnum = pgEnum('document_kind', [
  'petition_letter',
  'expert_letter',
  'form_i129',
  'exhibit',
  'cover',
  'other',
]);

export const agentNameEnum = pgEnum('agent_name', [
  'intake',
  'evidence_curator',
  'expert_letter_drafter',
  'petition_drafter',
  'rfe_responder',
  'qa_reviewer',
]);

export const agentStatusEnum = pgEnum('agent_status', [
  'queued',
  'running',
  'awaiting_gate',
  'completed',
  'failed',
  'cancelled',
]);

export const gateActionTypeEnum = pgEnum('gate_action_type', [
  'approve',
  'reject',
  'edit',
  'escalate',
]);

// -- Tenants & users -------------------------------------------------------

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: varchar('slug', { length: 64 }).notNull().unique(),
    workosOrgId: text('workos_org_id').unique(),
    branding: jsonb('branding').$type<{
      logoUrl?: string;
      primaryColor?: string;
      accentColor?: string;
    }>(),
    settings: jsonb('settings').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tenants_slug_idx').on(t.slug)],
);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    workosUserId: text('workos_user_id').unique(),
    email: text('email').notNull(),
    fullName: text('full_name'),
    role: userRoleEnum('role').notNull().default('paralegal'),
    barNumber: text('bar_number'),
    barState: varchar('bar_state', { length: 2 }),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('users_tenant_idx').on(t.tenantId),
    index('users_email_idx').on(t.email),
  ],
);

// -- Beneficiaries (artists) & sponsors -----------------------------------

export const artists = pgTable(
  'artists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    legalName: text('legal_name').notNull(),
    stageName: text('stage_name'),
    nationality: varchar('nationality', { length: 3 }),
    dob: timestamp('dob'),
    field: text('field'),
    bio: text('bio'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('artists_tenant_idx').on(t.tenantId)],
);

export const sponsors = pgTable(
  'sponsors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    fein: varchar('fein', { length: 16 }),
    addressLine1: text('address_line1'),
    addressLine2: text('address_line2'),
    city: text('city'),
    state: varchar('state', { length: 2 }),
    postalCode: varchar('postal_code', { length: 16 }),
    country: varchar('country', { length: 3 }).default('USA'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sponsors_tenant_idx').on(t.tenantId)],
);

// -- Cases -----------------------------------------------------------------

export const cases = pgTable(
  'cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    artistId: uuid('artist_id').references(() => artists.id, { onDelete: 'set null' }),
    sponsorId: uuid('sponsor_id').references(() => sponsors.id, { onDelete: 'set null' }),
    leadAttorneyId: uuid('lead_attorney_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    paralegalId: uuid('paralegal_id').references(() => users.id, { onDelete: 'set null' }),
    visaType: visaTypeEnum('visa_type').notNull().default('O-1B'),
    status: caseStatusEnum('status').notNull().default('intake'),
    title: text('title').notNull(),
    receiptNumber: text('receipt_number'),
    priorityDate: timestamp('priority_date'),
    targetFilingDate: timestamp('target_filing_date'),
    filedAt: timestamp('filed_at', { withTimezone: true }),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('cases_tenant_idx').on(t.tenantId),
    index('cases_status_idx').on(t.tenantId, t.status),
    index('cases_artist_idx').on(t.artistId),
  ],
);

// -- Evidence --------------------------------------------------------------

export const evidenceItems = pgTable(
  'evidence_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    caseId: uuid('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    category: evidenceCategoryEnum('category').notNull(),
    status: evidenceStatusEnum('status').notNull().default('proposed'),
    title: text('title').notNull(),
    description: text('description'),
    sourceUrl: text('source_url'),
    sourceDocumentId: uuid('source_document_id'),
    proposedByAgentRunId: uuid('proposed_by_agent_run_id'),
    decidedByUserId: uuid('decided_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    strength: integer('strength'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('evidence_tenant_case_idx').on(t.tenantId, t.caseId),
    index('evidence_status_idx').on(t.caseId, t.status),
  ],
);

// -- Documents -------------------------------------------------------------

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
    kind: documentKindEnum('kind').notNull(),
    title: text('title').notNull(),
    storageKey: text('storage_key').notNull(),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    pageCount: integer('page_count'),
    version: integer('version').notNull().default(1),
    isCurrent: boolean('is_current').notNull().default(true),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdByAgentRunId: uuid('created_by_agent_run_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('documents_tenant_case_idx').on(t.tenantId, t.caseId),
    index('documents_kind_idx').on(t.caseId, t.kind),
  ],
);

// -- Agents ----------------------------------------------------------------

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
    agent: agentNameEnum('agent').notNull(),
    status: agentStatusEnum('status').notNull().default('queued'),
    triggeredByUserId: uuid('triggered_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    triggerJobId: text('trigger_job_id'),
    input: jsonb('input').$type<Record<string, unknown>>(),
    output: jsonb('output').$type<Record<string, unknown>>(),
    error: text('error'),
    tokenUsage: jsonb('token_usage').$type<{
      inputTokens?: number;
      outputTokens?: number;
      cachedTokens?: number;
    }>(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('agent_runs_tenant_idx').on(t.tenantId),
    index('agent_runs_case_idx').on(t.caseId),
    index('agent_runs_status_idx').on(t.tenantId, t.status),
  ],
);

export const gateActions = pgTable(
  'gate_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    agentRunId: uuid('agent_run_id')
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: gateActionTypeEnum('action').notNull(),
    notes: text('notes'),
    payload: jsonb('payload').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('gate_actions_tenant_idx').on(t.tenantId),
    index('gate_actions_run_idx').on(t.agentRunId),
  ],
);

// -- Audit log -------------------------------------------------------------

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    actorAgentRunId: uuid('actor_agent_run_id'),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: uuid('resource_id'),
    diff: jsonb('diff').$type<Record<string, unknown>>(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_tenant_idx').on(t.tenantId),
    index('audit_resource_idx').on(t.resourceType, t.resourceId),
    index('audit_created_idx').on(t.tenantId, t.createdAt),
  ],
);

// -- RAG (pgvector) --------------------------------------------------------
// Voyage AI voyage-3-large embeddings → 1024 dims
// Requires: CREATE EXTENSION IF NOT EXISTS vector;

export const ragDocuments = pgTable(
  'rag_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
    sourceType: text('source_type').notNull(),
    sourceUri: text('source_uri'),
    title: text('title'),
    contentHash: varchar('content_hash', { length: 64 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('rag_docs_tenant_idx').on(t.tenantId),
    index('rag_docs_case_idx').on(t.caseId),
    index('rag_docs_hash_idx').on(t.contentHash),
  ],
);

export const ragChunks = pgTable(
  'rag_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => ragDocuments.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    tokenCount: integer('token_count'),
    embedding: vector('embedding', { dimensions: 1024 }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('rag_chunks_tenant_idx').on(t.tenantId),
    index('rag_chunks_doc_idx').on(t.documentId),
    index('rag_chunks_embedding_idx').using(
      'hnsw',
      sql`${t.embedding} vector_cosine_ops`,
    ),
  ],
);

// -- Marketplace MVP -------------------------------------------------------

export const artistCaseStatusEnum = pgEnum('artist_case_status', [
  'intake',
  'processing',
  'dossier_preview',
  'audited',
  'audit_expired',
  'dossier_ready',
  'listed',
  'matched',
  'claimed',
  'released_back',
  'closed',
]);

// v3 audit funnel — paid audit replaces free dossier as the listing toll.
export const auditTierEnum = pgEnum('audit_tier', ['standard', 'concierge']);

export const auditAddonKindEnum = pgEnum('audit_addon_kind', [
  'manager_kit',
  'express_evidence',
  'relist_boost',
  're_audit',
]);

export const firmStatusEnum = pgEnum('firm_status', ['pending', 'approved', 'suspended']);

// DEPRECATED — v2 claim model. Retained for one release behind a feature flag
// so existing rows in firm_bids continue to read.
export const bidStatusEnum = pgEnum('bid_status', [
  'pending',
  'accepted',
  'declined',
  'withdrawn',
]);

export const claimStatusEnum = pgEnum('claim_status', [
  'active',
  'engaged',
  'released',
  'closed',
]);

export const pricingBandEnum = pgEnum('pricing_band', ['low', 'medium', 'high']);

export const magicLinkRoleEnum = pgEnum('magic_link_role', ['artist', 'firm', 'admin']);

export const artistAccounts = pgTable(
  'artist_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    legalName: text('legal_name'),
    stageName: text('stage_name'),
    phone: text('phone'),
    citizenship: text('citizenship'),
    basedIn: text('based_in'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('artist_accounts_email_idx').on(t.email)],
);

export const artistCases = pgTable(
  'artist_cases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    artistId: uuid('artist_id')
      .notNull()
      .references(() => artistAccounts.id, { onDelete: 'cascade' }),
    visaType: text('visa_type').notNull().default('O-1B'),
    intakeData: jsonb('intake_data').$type<Record<string, unknown>>(),
    evidenceData: jsonb('evidence_data').$type<Record<string, unknown>>(),
    evidenceScore: integer('evidence_score'),
    criteriaCoverage: jsonb('criteria_coverage').$type<Record<string, unknown>>(),
    status: artistCaseStatusEnum('status').notNull().default('intake'),
    targetVisaDate: timestamp('target_visa_date'),
    location: text('location'),
    budgetBand: text('budget_band'),
    briefNote: text('brief_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('artist_cases_artist_idx').on(t.artistId),
    index('artist_cases_status_idx').on(t.status),
  ],
);

export const firmProfiles = pgTable(
  'firm_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    slug: varchar('slug', { length: 64 }).notNull().unique(),
    logoUrl: text('logo_url'),
    bio: text('bio'),
    specialties: jsonb('specialties').$type<string[]>(),
    languages: jsonb('languages').$type<string[]>(),
    feePhilosophy: text('fee_philosophy'),
    casesHandled: integer('cases_handled').notNull().default(0),
    status: firmStatusEnum('status').notNull().default('pending'),
    ailaMember: boolean('aila_member').notNull().default(false),
    contactEmail: text('contact_email').notNull(),
    contactName: text('contact_name'),
    appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
  },
  (t) => [
    index('firm_profiles_status_idx').on(t.status),
    index('firm_profiles_email_idx').on(t.contactEmail),
  ],
);

// DEPRECATED — v2 claim model. Kept in place behind feature flag for one
// release so historical rows continue to read. Drop in a later migration.
export const firmBids = pgTable(
  'firm_bids',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => artistCases.id, { onDelete: 'cascade' }),
    firmId: uuid('firm_id')
      .notNull()
      .references(() => firmProfiles.id, { onDelete: 'cascade' }),
    priceCents: integer('price_cents').notNull(),
    timelineWeeks: integer('timeline_weeks').notNull(),
    pitch: text('pitch').notNull(),
    sampleUrl: text('sample_url'),
    status: bidStatusEnum('status').notNull().default('pending'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
  },
  (t) => [
    index('firm_bids_case_idx').on(t.caseId),
    index('firm_bids_firm_idx').on(t.firmId),
    index('firm_bids_status_idx').on(t.status),
  ],
);

// v2 claim model. First eligible vetted firm to claim wins exclusive 7-day
// engagement window for a flat unlock fee. Stripe wiring is Track B —
// `unlockFeeCents` is captured from `case_pricing` at claim time; real charge
// id will live alongside it later.
export const firmClaims = pgTable(
  'firm_claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => artistCases.id, { onDelete: 'cascade' }),
    firmId: uuid('firm_id')
      .notNull()
      .references(() => firmProfiles.id, { onDelete: 'cascade' }),
    unlockFeeCents: integer('unlock_fee_cents').notNull(),
    status: claimStatusEnum('status').notNull().default('active'),
    claimedAt: timestamp('claimed_at', { withTimezone: true }).notNull().defaultNow(),
    engagedAt: timestamp('engaged_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    releaseReason: text('release_reason'),
  },
  (t) => [
    index('firm_claims_case_idx').on(t.caseId),
    index('firm_claims_firm_idx').on(t.firmId),
    index('firm_claims_status_idx').on(t.status),
  ],
);

// Pricing tiers keyed by evidence-quality band. Low/Medium/High.
// Seed values: $300 / $400 / $500. Editable via admin in Track B.
export const casePricing = pgTable(
  'case_pricing',
  {
    band: pricingBandEnum('band').primaryKey(),
    unlockFeeCents: integer('unlock_fee_cents').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

// Recomputed from claim history. score = engagedWithinWindow / claimsTotal * 100.
export const firmScores = pgTable(
  'firm_scores',
  {
    firmId: uuid('firm_id')
      .primaryKey()
      .references(() => firmProfiles.id, { onDelete: 'cascade' }),
    claimsTotal: integer('claims_total').notNull().default(0),
    engagedWithinWindow: integer('engaged_within_window').notNull().default(0),
    score: integer('score').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

export const magicLinkTokens = pgTable(
  'magic_link_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    role: magicLinkRoleEnum('role').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('magic_link_email_idx').on(t.email), index('magic_link_token_idx').on(t.token)],
);

// Handoffs (intro/retainer tracking).
// claimId is the v2 reference; acceptedBidId is DEPRECATED — v2 claim model.
export const handoffs = pgTable(
  'handoffs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => artistCases.id, { onDelete: 'cascade' }),
    firmId: uuid('firm_id')
      .notNull()
      .references(() => firmProfiles.id, { onDelete: 'cascade' }),
    claimId: uuid('claim_id').references(() => firmClaims.id, { onDelete: 'set null' }),
    acceptedBidId: uuid('accepted_bid_id').references(() => firmBids.id, {
      onDelete: 'set null',
    }),
    introSentAt: timestamp('intro_sent_at', { withTimezone: true }),
    retainerUrl: text('retainer_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('handoffs_case_idx').on(t.caseId), index('handoffs_firm_idx').on(t.firmId)],
);

export const firmWaitlist = pgTable(
  'firm_waitlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firmName: text('firm_name').notNull(),
    contactName: text('contact_name'),
    contactEmail: text('contact_email').notNull(),
    website: text('website'),
    ailaMember: boolean('aila_member').notNull().default(false),
    casesLast12Mo: integer('cases_last_12mo'),
    appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
    status: firmStatusEnum('status').notNull().default('pending'),
  },
  (t) => [index('firm_waitlist_email_idx').on(t.contactEmail)],
);

// v3 audit funnel. Stripe wiring is Track B — `stripeChargeId` stays null in
// the demo, `priceCents` is captured from PRICING.audit at purchase time.
// `expiresAt = paidAt + 90d`. After expiry, case status flips to `audit_expired`.
export const artistAudits = pgTable(
  'artist_audits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => artistCases.id, { onDelete: 'cascade' }),
    tier: auditTierEnum('tier').notNull(),
    priceCents: integer('price_cents').notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    stripeChargeId: text('stripe_charge_id'),
  },
  (t) => [
    index('artist_audits_case_idx').on(t.caseId),
    index('artist_audits_expires_idx').on(t.expiresAt),
  ],
);

// Per-case audit add-ons (manager kit, express, re-list boost, re-audit).
// Same demo posture: priceCents recorded, no real charge.
export const auditAddons = pgTable(
  'audit_addons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    caseId: uuid('case_id')
      .notNull()
      .references(() => artistCases.id, { onDelete: 'cascade' }),
    kind: auditAddonKindEnum('kind').notNull(),
    priceCents: integer('price_cents').notNull(),
    purchasedAt: timestamp('purchased_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_addons_case_idx').on(t.caseId)],
);

// -- Type exports ----------------------------------------------------------

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Artist = typeof artists.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type EvidenceItem = typeof evidenceItems.$inferSelect;
export type NewEvidenceItem = typeof evidenceItems.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type GateAction = typeof gateActions.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type RagDocument = typeof ragDocuments.$inferSelect;
export type RagChunk = typeof ragChunks.$inferSelect;
export type ArtistAccount = typeof artistAccounts.$inferSelect;
export type NewArtistAccount = typeof artistAccounts.$inferInsert;
export type ArtistCase = typeof artistCases.$inferSelect;
export type NewArtistCase = typeof artistCases.$inferInsert;
export type FirmProfile = typeof firmProfiles.$inferSelect;
export type NewFirmProfile = typeof firmProfiles.$inferInsert;
// DEPRECATED — v2 claim model.
export type FirmBid = typeof firmBids.$inferSelect;
export type NewFirmBid = typeof firmBids.$inferInsert;
export type FirmClaim = typeof firmClaims.$inferSelect;
export type NewFirmClaim = typeof firmClaims.$inferInsert;
export type CasePricing = typeof casePricing.$inferSelect;
export type NewCasePricing = typeof casePricing.$inferInsert;
export type FirmScore = typeof firmScores.$inferSelect;
export type NewFirmScore = typeof firmScores.$inferInsert;
export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type Handoff = typeof handoffs.$inferSelect;
export type FirmWaitlistEntry = typeof firmWaitlist.$inferSelect;
export type ArtistAudit = typeof artistAudits.$inferSelect;
export type NewArtistAudit = typeof artistAudits.$inferInsert;
export type AuditAddon = typeof auditAddons.$inferSelect;
export type NewAuditAddon = typeof auditAddons.$inferInsert;
