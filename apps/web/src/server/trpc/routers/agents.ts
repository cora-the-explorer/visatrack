import { z } from 'zod';
import { agentNameSchema, gateDecisionSchema } from '@spinvisa/api-types';
import { protectedProcedure, router } from '../init';

export const agentsRouter = router({
  trigger: protectedProcedure
    .input(
      z.object({
        agent: agentNameSchema,
        caseId: z.string().uuid(),
        payload: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async () => {
      return { agentRunId: 'stub' };
    }),
  gateDecision: protectedProcedure.input(gateDecisionSchema).mutation(async () => {
    return { ok: true };
  }),
  listGateQueue: protectedProcedure.query(async () => {
    return [] as const;
  }),
});
