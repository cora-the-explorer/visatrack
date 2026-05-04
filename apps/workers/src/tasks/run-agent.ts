import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import { db, eq, schema } from '@visa-track/db';
import {
  intakeAgent,
  evidenceCuratorAgent,
  expertLetterDrafterAgent,
  petitionDrafterAgent,
  rfeResponderAgent,
  qaReviewerAgent,
  type AgentDefinition,
} from '@visa-track/agents';

const { agentRuns, auditLog } = schema;

const REGISTRY: Record<string, AgentDefinition> = {
  intake: intakeAgent,
  evidence_curator: evidenceCuratorAgent,
  expert_letter_drafter: expertLetterDrafterAgent,
  petition_drafter: petitionDrafterAgent,
  rfe_responder: rfeResponderAgent,
  qa_reviewer: qaReviewerAgent,
};

const inputSchema = z.object({
  agent: z.enum([
    'intake',
    'evidence_curator',
    'expert_letter_drafter',
    'petition_drafter',
    'rfe_responder',
    'qa_reviewer',
  ]),
  tenantId: z.string().uuid(),
  caseId: z.string().uuid(),
  agentRunId: z.string().uuid(),
  triggeredByUserId: z.string().uuid().optional(),
  payload: z.record(z.unknown()).optional(),
});

export const runAgent = task({
  id: 'run-agent',
  retry: { maxAttempts: 2 },
  run: async (raw: unknown) => {
    const input = inputSchema.parse(raw);
    const agent = REGISTRY[input.agent];
    if (!agent) throw new Error(`Unknown agent: ${input.agent}`);

    const startedAt = new Date();
    await db
      .update(agentRuns)
      .set({ status: 'running', startedAt, updatedAt: startedAt })
      .where(eq(agentRuns.id, input.agentRunId));

    try {
      const result = await agent.run({
        tenantId: input.tenantId,
        caseId: input.caseId,
        triggeredByUserId: input.triggeredByUserId,
        payload: input.payload,
      });

      const completedAt = new Date();
      await db
        .update(agentRuns)
        .set({
          status: result.status,
          output: result.output,
          error: result.error,
          tokenUsage: result.tokenUsage,
          completedAt,
          updatedAt: completedAt,
        })
        .where(eq(agentRuns.id, input.agentRunId));

      await db.insert(auditLog).values({
        tenantId: input.tenantId,
        actorAgentRunId: input.agentRunId,
        action: `agent.run.${result.status}`,
        resourceType: 'agent_run',
        resourceId: input.agentRunId,
        diff: { agent: input.agent, status: result.status },
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const completedAt = new Date();

      await db
        .update(agentRuns)
        .set({
          status: 'failed',
          error: errorMessage,
          completedAt,
          updatedAt: completedAt,
        })
        .where(eq(agentRuns.id, input.agentRunId));

      await db.insert(auditLog).values({
        tenantId: input.tenantId,
        actorAgentRunId: input.agentRunId,
        action: 'agent.run.failed',
        resourceType: 'agent_run',
        resourceId: input.agentRunId,
        diff: { agent: input.agent, error: errorMessage },
      });

      throw err;
    }
  },
});
