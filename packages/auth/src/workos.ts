// WorkOS client wrapper. Stubbed until env wiring is complete.
import { WorkOS } from '@workos-inc/node';

let cached: WorkOS | null = null;

export function getWorkOS(): WorkOS {
  if (cached) return cached;
  const apiKey = process.env.WORKOS_API_KEY;
  const clientId = process.env.WORKOS_CLIENT_ID;
  if (!apiKey || !clientId) {
    throw new Error('WORKOS_API_KEY and WORKOS_CLIENT_ID must be set');
  }
  cached = new WorkOS(apiKey, { clientId });
  return cached;
}

export interface WorkOSAuthResult {
  userId: string;
  email: string;
  organizationId: string | null;
  fullName: string | null;
}
