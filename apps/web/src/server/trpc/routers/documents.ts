import { z } from 'zod';
import { protectedProcedure, router } from '../init';

export const documentsRouter = router({
  listByCase: protectedProcedure.input(z.string().uuid()).query(async () => {
    return [] as const;
  }),
  uploadUrl: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        filename: z.string(),
        contentType: z.string(),
      }),
    )
    .mutation(async () => {
      return { uploadUrl: '', storageKey: '' };
    }),
});
