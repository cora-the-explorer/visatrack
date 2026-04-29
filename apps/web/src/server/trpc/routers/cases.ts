import { z } from 'zod';
import { createCaseSchema, pipelineQuerySchema, updateCaseSchema } from '@spinvisa/api-types';
import { protectedProcedure, router } from '../init';

export const casesRouter = router({
  list: protectedProcedure.input(pipelineQuerySchema.optional()).query(async () => {
    // TODO: query db scoped by tenantId
    return [] as const;
  }),
  byId: protectedProcedure.input(z.string().uuid()).query(async () => {
    return null;
  }),
  create: protectedProcedure.input(createCaseSchema).mutation(async () => {
    return { id: 'stub' };
  }),
  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: updateCaseSchema }))
    .mutation(async () => {
      return { ok: true };
    }),
});
