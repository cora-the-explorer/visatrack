import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { agentNameSchema, gateDecisionSchema } from '@visa-track/api-types';
import { and, desc, eq, schema } from '@visa-track/db';
import { protectedProcedure, router } from '../init';

const { agentRuns, gateActions, auditLog, cases } = schema;

async function dispatchTriggerTask(payload: {
  agentRunId: string;
  tenantId: string;
  caseId: string;
  agent: string;
  triggeredByUserId: string;
  payload: Record<string, unknown>;
}): Promise<string | null> {
  const apiUrl = process.env.TRIGGER_API_URL ?? 'https://api.trigger.dev';
  const secret = process.env.TRIGGER_SECRET_KEY;
  if (!secret) {
    console.warn('[agents.trigger] TRIGGER_SECRET_KEY not set — skipping dispatch');
    return null;
  }
  try {
    const res = await fetch(`${apiUrl}/api/v1/tasks/run-agent/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ payload }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[agents.trigger] dispatch failed', res.status, text);
      return null;
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return data.id ?? null;
  } catch (err) {
    console.error('[agents.trigger] dispatch error', err);
    return null;
  }
}

export const agentsRouter = router({
  trigger: protectedProcedure
    .input(
      z.object({
        agent: agentNameSchema,
        caseId: z.string().uuid(),
        payload: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tenantId = ctx.session.tenantId;
      const userId = ctx.session.userId;

      const [run] = await ctx.db
        .insert(agentRuns)
        .values({
          tenantId,
          caseId: input.caseId,
          agent: input.agent,
          status: 'queued',
          triggeredByUserId: userId,
          input: (input.payload ?? {}) as Record<string, unknown>,
        })
        .returning({ id: agentRuns.id });

      if (!run) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create agent run',
        });
      }

      const triggerJobId = await dispatchTriggerTask({
        agentRunId: run.id,
        tenantId,
        caseId: input.caseId,
        agent: input.agent,
        triggeredByUserId: userId,
        payload: input.payload ?? {},
      });

      if (triggerJobId) {
        await ctx.db
          .update(agentRuns)
          .set({ triggerJobId, updatedAt: new Date() })
          .where(eq(agentRuns.id, run.id));
      }

      await ctx.db.insert(auditLog).values({
        tenantId,
        actorUserId: userId,
        action: 'agent.trigger',
        resourceType: 'agent_run',
        resourceId: run.id,
        diff: { agent: input.agent, caseId: input.caseId },
      });

      return { agentRunId: run.id };
    }),

  gateDecision: protectedProcedure.input(gateDecisionSchema).mutation(async ({ ctx, input }) => {
    const tenantId = ctx.session.tenantId;
    const userId = ctx.session.userId;

    const [existing] = await ctx.db
      .select({ id: agentRuns.id })
      .from(agentRuns)
      .where(and(eq(agentRuns.id, input.agentRunId), eq(agentRuns.tenantId, tenantId)))
      .limit(1);

    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Agent run not found' });
    }

    await ctx.db.insert(gateActions).values({
      tenantId,
      agentRunId: input.agentRunId,
      actorUserId: userId,
      action: input.action,
      notes: input.notes,
      payload: input.payload,
    });

    const nextStatus =
      input.action === 'approve'
        ? 'completed'
        : input.action === 'reject'
          ? 'cancelled'
          : input.action === 'escalate'
            ? 'awaiting_gate'
            : 'completed';

    await ctx.db
      .update(agentRuns)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(agentRuns.id, input.agentRunId));

    await ctx.db.insert(auditLog).values({
      tenantId,
      actorUserId: userId,
      action: `agent.gate.${input.action}`,
      resourceType: 'agent_run',
      resourceId: input.agentRunId,
      diff: { action: input.action, notes: input.notes },
    });

    return { ok: true };
  }),

  listGateQueue: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.session.tenantId;
    const rows = await ctx.db
      .select({
        id: agentRuns.id,
        agent: agentRuns.agent,
        status: agentRuns.status,
        caseId: agentRuns.caseId,
        caseTitle: cases.title,
        output: agentRuns.output,
        startedAt: agentRuns.startedAt,
        completedAt: agentRuns.completedAt,
        createdAt: agentRuns.createdAt,
      })
      .from(agentRuns)
      .leftJoin(cases, eq(agentRuns.caseId, cases.id))
      .where(and(eq(agentRuns.tenantId, tenantId), eq(agentRuns.status, 'awaiting_gate')))
      .orderBy(desc(agentRuns.createdAt));

    return rows;
  }),
});
