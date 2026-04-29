import { z } from 'zod';

export const visaTypeSchema = z.enum(['O-1B', 'P-1B', 'O-2', 'P-1S']);
export type VisaType = z.infer<typeof visaTypeSchema>;

export const caseStatusSchema = z.enum([
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
export type CaseStatus = z.infer<typeof caseStatusSchema>;

export const userRoleSchema = z.enum([
  'owner',
  'attorney',
  'paralegal',
  'analyst',
  'viewer',
]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const evidenceCategorySchema = z.enum([
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
export type EvidenceCategory = z.infer<typeof evidenceCategorySchema>;

export const evidenceStatusSchema = z.enum([
  'proposed',
  'accepted',
  'rejected',
  'needs_review',
]);
export type EvidenceStatus = z.infer<typeof evidenceStatusSchema>;

export const agentNameSchema = z.enum([
  'intake',
  'evidence_curator',
  'expert_letter_drafter',
  'petition_drafter',
  'rfe_responder',
  'qa_reviewer',
]);
export type AgentName = z.infer<typeof agentNameSchema>;

export const agentStatusSchema = z.enum([
  'queued',
  'running',
  'awaiting_gate',
  'completed',
  'failed',
  'cancelled',
]);
export type AgentStatus = z.infer<typeof agentStatusSchema>;

export const gateActionTypeSchema = z.enum(['approve', 'reject', 'edit', 'escalate']);
export type GateActionType = z.infer<typeof gateActionTypeSchema>;

// -- Case CRUD payloads --------------------------------------------------

export const createCaseSchema = z.object({
  title: z.string().min(1).max(200),
  visaType: visaTypeSchema,
  artistId: z.string().uuid().optional(),
  sponsorId: z.string().uuid().optional(),
  leadAttorneyId: z.string().uuid().optional(),
  paralegalId: z.string().uuid().optional(),
  targetFilingDate: z.string().datetime().optional(),
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: caseStatusSchema.optional(),
});
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;

// -- Evidence ------------------------------------------------------------

export const decideEvidenceSchema = z.object({
  evidenceId: z.string().uuid(),
  decision: z.enum(['accepted', 'rejected']),
  rejectionReason: z.string().optional(),
});
export type DecideEvidenceInput = z.infer<typeof decideEvidenceSchema>;

// -- Agent gate actions --------------------------------------------------

export const gateDecisionSchema = z.object({
  agentRunId: z.string().uuid(),
  action: gateActionTypeSchema,
  notes: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});
export type GateDecisionInput = z.infer<typeof gateDecisionSchema>;

// -- Pipeline list -------------------------------------------------------

export const pipelineQuerySchema = z.object({
  status: caseStatusSchema.optional(),
  attorneyId: z.string().uuid().optional(),
  visaType: visaTypeSchema.optional(),
});
export type PipelineQuery = z.infer<typeof pipelineQuerySchema>;
