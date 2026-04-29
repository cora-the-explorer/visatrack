import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { Session } from '@spinvisa/auth';

export interface TRPCContext {
  session: Session | null;
  req: Request;
}

export async function createContext({ req }: FetchCreateContextFnOptions): Promise<TRPCContext> {
  // TODO: resolve session from WorkOS cookie
  return { session: null, req };
}
