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
