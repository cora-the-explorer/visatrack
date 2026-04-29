import { router } from '../init';
import { casesRouter } from './cases';
import { evidenceRouter } from './evidence';
import { agentsRouter } from './agents';
import { documentsRouter } from './documents';

export const appRouter = router({
  cases: casesRouter,
  evidence: evidenceRouter,
  agents: agentsRouter,
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
