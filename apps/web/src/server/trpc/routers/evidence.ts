import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { decideEvidenceSchema } from '@spinvisa/api-types';
import { and, desc, eq, schema } from '@spinvisa/db';
import { protectedProcedure, router } from '../init';

const { evidenceItems, auditLog } = schema;

export const evidenceRouter = router({
  listByCase: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const rows = await ctx.db
      .select()
      .from(evidenceItems)
      .where(and(eq(evidenceItems.tenantId, tenantId), eq(evidenceItems.caseId, input)))
      .orderBy(desc(evidenceItems.createdAt));
    return rows;
  }),

  decide: protectedProcedure.input(decideEvidenceSchema).mutation(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const userId = ctx.session.userId;

    const [updated] = await ctx.db
      .update(evidenceItems)
      .set({
        status: input.decision,
        decidedByUserId: userId,
        decidedAt: new Date(),
        rejectionReason: input.decision === 'rejected' ? input.rejectionReason : null,
        updatedAt: new Date(),
      })
      .where(and(eq(evidenceItems.id, input.evidenceId), eq(evidenceItems.tenantId, tenantId)))
      .returning({ id: evidenceItems.id });

    if (!updated) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Evidence item not found' });
    }

    await ctx.db.insert(auditLog).values({
      tenantId,
      actorUserId: userId,
      action: `evidence.${input.decision}`,
      resourceType: 'evidence_item',
      resourceId: updated.id,
      diff: { decision: input.decision, rejectionReason: input.rejectionReason },
    });

    return { ok: true };
  }),
});
