import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { Session } from '@spinvisa/auth';
import { db, type DB } from '@spinvisa/db';

export interface TRPCContext {
  session: Session | null;
  req: Request;
  db: DB;
}

const DEV_TENANT_ID = process.env.DEV_TENANT_ID ?? '00000000-0000-0000-0000-000000000001';
const DEV_USER_ID = process.env.DEV_USER_ID ?? '00000000-0000-0000-0000-000000000002';

function devSession(): Session {
  return {
    userId: DEV_USER_ID,
    tenantId: DEV_TENANT_ID,
    email: 'dev@spinvisa.local',
    fullName: 'Dev User',
    role: 'owner',
  };
}

export async function createContext({ req }: FetchCreateContextFnOptions): Promise<TRPCContext> {
  // TODO: resolve session from WorkOS cookie
  // For local/preview without WorkOS configured, fall back to a dev session.
  const session = process.env.WORKOS_API_KEY ? null : devSession();
  return { session, req, db };
}
