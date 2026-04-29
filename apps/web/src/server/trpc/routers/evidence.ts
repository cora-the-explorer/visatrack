import { z } from 'zod';
import { decideEvidenceSchema } from '@spinvisa/api-types';
import { protectedProcedure, router } from '../init';

export const evidenceRouter = router({
  listByCase: protectedProcedure.input(z.string().uuid()).query(async () => {
    return [] as const;
  }),
  decide: protectedProcedure.input(decideEvidenceSchema).mutation(async () => {
    return { ok: true };
  }),
});
