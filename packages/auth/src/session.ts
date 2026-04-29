// Session shape used by the web app and API. Resolved from WorkOS cookie.
import type { Role } from './rbac';

export interface Session {
  userId: string;
  tenantId: string;
  email: string;
  fullName: string | null;
  role: Role;
}

export class UnauthenticatedError extends Error {
  override readonly name = 'UnauthenticatedError';
  readonly status = 401;
}
