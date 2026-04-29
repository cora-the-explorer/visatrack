import { task } from '@trigger.dev/sdk/v3';
import { z } from 'zod';
import {
  intakeAgent,
  evidenceCuratorAgent,
  expertLetterDrafterAgent,
  petitionDrafterAgent,
  rfeResponderAgent,
  qaReviewerAgent,
  type AgentDefinition,
} from '@spinvisa/agents';

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
    const result = await agent.run({
      tenantId: input.tenantId,
      caseId: input.caseId,
      triggeredByUserId: input.triggeredByUserId,
      payload: input.payload,
    });
    return result;
  },
});
