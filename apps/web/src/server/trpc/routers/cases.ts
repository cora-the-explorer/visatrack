import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createCaseSchema, pipelineQuerySchema, updateCaseSchema } from '@spinvisa/api-types';
import { alias, and, desc, eq, schema, sql } from '@spinvisa/db';
import { protectedProcedure, router } from '../init';

const { cases, artists, sponsors, users, auditLog } = schema;

export const casesRouter = router({
  list: protectedProcedure.input(pipelineQuerySchema.optional()).query(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const leadAttorney = alias(users, 'lead_attorney');

    const conditions = [eq(cases.tenantId, tenantId)];
    if (input?.status) conditions.push(eq(cases.status, input.status));
    if (input?.visaType) conditions.push(eq(cases.visaType, input.visaType));
    if (input?.attorneyId) conditions.push(eq(cases.leadAttorneyId, input.attorneyId));

    const rows = await ctx.db
      .select({
        id: cases.id,
        title: cases.title,
        visaType: cases.visaType,
        status: cases.status,
        artistName: artists.legalName,
        leadAttorneyName: leadAttorney.fullName,
        targetFilingDate: cases.targetFilingDate,
        createdAt: cases.createdAt,
      })
      .from(cases)
      .leftJoin(artists, eq(cases.artistId, artists.id))
      .leftJoin(leadAttorney, eq(cases.leadAttorneyId, leadAttorney.id))
      .where(and(...conditions))
      .orderBy(desc(cases.createdAt));

    return rows;
  }),

  byId: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const leadAttorney = alias(users, 'lead_attorney');
    const paralegal = alias(users, 'paralegal');

    const rows = await ctx.db
      .select({
        case: cases,
        artist: artists,
        sponsor: sponsors,
        leadAttorney: leadAttorney,
        paralegal: paralegal,
      })
      .from(cases)
      .leftJoin(artists, eq(cases.artistId, artists.id))
      .leftJoin(sponsors, eq(cases.sponsorId, sponsors.id))
      .leftJoin(leadAttorney, eq(cases.leadAttorneyId, leadAttorney.id))
      .leftJoin(paralegal, eq(cases.paralegalId, paralegal.id))
      .where(and(eq(cases.id, input), eq(cases.tenantId, tenantId)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      ...row.case,
      artist: row.artist,
      sponsor: row.sponsor,
      leadAttorney: row.leadAttorney,
      paralegal: row.paralegal,
    };
  }),

  create: protectedProcedure.input(createCaseSchema).mutation(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const userId = ctx.session.userId;

    const [created] = await ctx.db
      .insert(cases)
      .values({
        tenantId,
        title: input.title,
        visaType: input.visaType,
        artistId: input.artistId,
        sponsorId: input.sponsorId,
        leadAttorneyId: input.leadAttorneyId,
        paralegalId: input.paralegalId,
        targetFilingDate: input.targetFilingDate ? new Date(input.targetFilingDate) : undefined,
      })
      .returning({ id: cases.id });

    if (!created) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create case' });
    }

    await ctx.db.insert(auditLog).values({
      tenantId,
      actorUserId: userId,
      action: 'case.create',
      resourceType: 'case',
      resourceId: created.id,
      diff: input as Record<string, unknown>,
    });

    return { id: created.id };
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.tenantId;
    const rows = await ctx.db
      .select({
        status: cases.status,
        visaType: cases.visaType,
        count: sql<number>`count(*)::int`,
      })
      .from(cases)
      .where(eq(cases.tenantId, tenantId))
      .groupBy(cases.status, cases.visaType);

    const byStatus: Record<string, number> = {};
    const byVisa: Record<string, number> = {};
    let total = 0;
    let approved = 0;
    let denied = 0;
    let decided = 0;
    for (const r of rows) {
      total += r.count;
      byStatus[r.status] = (byStatus[r.status] ?? 0) + r.count;
      byVisa[r.visaType] = (byVisa[r.visaType] ?? 0) + r.count;
      if (r.status === 'approved') {
        approved += r.count;
        decided += r.count;
      }
      if (r.status === 'denied') {
        denied += r.count;
        decided += r.count;
      }
    }
    const approvalRate = decided === 0 ? null : Math.round((approved / decided) * 100);
    return { total, approved, denied, approvalRate, byStatus, byVisa };
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: updateCaseSchema }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.tenantId;
      const userId = ctx.session.userId;

      const patch: Record<string, unknown> = {
        ...input.patch,
        updatedAt: new Date(),
      };
      if (input.patch.targetFilingDate) {
        patch.targetFilingDate = new Date(input.patch.targetFilingDate);
      }

      const [updated] = await ctx.db
        .update(cases)
        .set(patch)
        .where(and(eq(cases.id, input.id), eq(cases.tenantId, tenantId)))
        .returning({ id: cases.id });

      if (!updated) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Case not found' });
      }

      await ctx.db.insert(auditLog).values({
        tenantId,
        actorUserId: userId,
        action: 'case.update',
        resourceType: 'case',
        resourceId: updated.id,
        diff: input.patch as Record<string, unknown>,
      });

      return { ok: true };
    }),
});
