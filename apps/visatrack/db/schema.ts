// visatrack — artist-funnel schema (separate from firm-console schema in @visa-track/db)
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const tierEnum = pgEnum('vt_tier', ['lite', 'standard', 'full']);

export const leadStatusEnum = pgEnum('vt_lead_status', [
  'new',
  'scanning',
  'scored',
  'error',
  'paid',
  'claimed',
]);

export const platformEnum = pgEnum('vt_platform', [
  'instagram',
  'tiktok',
  'youtube',
  'press',
]);

export const leads = pgTable(
  'vt_leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    igHandle: text('ig_handle').notNull(),
    email: text('email'),
    tier: tierEnum('tier').notNull().default('lite'),
    status: leadStatusEnum('status').notNull().default('new'),
    evidenceScore: integer('evidence_score'),
    gapSummary: jsonb('gap_summary').$type<GapSummary | null>(),
    claimedByFirmId: uuid('claimed_by_firm_id'),
    errorMessage: text('error_message'),
  },
  (t) => [
    index('vt_leads_created_idx').on(t.createdAt),
    index('vt_leads_status_idx').on(t.status),
    index('vt_leads_handle_idx').on(t.igHandle),
  ],
);

export const evidenceScans = pgTable(
  'vt_evidence_scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    platform: platformEnum('platform').notNull(),
    rawPayload: jsonb('raw_payload').$type<Record<string, unknown>>(),
    normalized: jsonb('normalized').$type<NormalizedScan | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('vt_scans_lead_idx').on(t.leadId),
    index('vt_scans_platform_idx').on(t.platform),
  ],
);

// -- Shared TS types --------------------------------------------------------

export const USCIS_O1_CRITERIA = [
  'awards',
  'published_material',
  'judging',
  'original_contributions',
  'scholarly_articles',
  'leading_role',
  'high_remuneration',
  'commercial_success',
] as const;

export type UscisCriterion = (typeof USCIS_O1_CRITERIA)[number];

export const USCIS_CRITERION_LABELS: Record<UscisCriterion, string> = {
  awards: 'Awards & honors',
  published_material: 'Published material about you',
  judging: 'Judging the work of others',
  original_contributions: 'Original contributions of major significance',
  scholarly_articles: 'Scholarly articles authored by you',
  leading_role: 'Leading or critical role',
  high_remuneration: 'High remuneration',
  commercial_success: 'Commercial success in performing arts',
};

export type GapSummary = {
  met: UscisCriterion[];
  gaps: UscisCriterion[];
  evidence: Partial<Record<UscisCriterion, string[]>>;
  notes?: string;
};

export type ScrapedPost = {
  shortcode: string;
  caption: string;
  like_count: number;
  comment_count: number;
  taken_at: number;
  media_type: 'image' | 'video' | 'carousel';
};

export type ScrapedProfile = {
  handle: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  bio: string;
  is_private: boolean;
  full_name?: string;
  posts: ScrapedPost[];
};

export type NormalizedScan = {
  followerCount: number;
  postCount: number;
  scrapedPostCount: number;
  avgLikes: number;
  avgComments: number;
  avgEngagement: number;
  topCaptions: string[];
  criteriaHits: Partial<Record<UscisCriterion, number>>;
};

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type EvidenceScan = typeof evidenceScans.$inferSelect;
