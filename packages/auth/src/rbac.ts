// Role-based access control for SpinVisa.

export type Role = 'owner' | 'attorney' | 'paralegal' | 'analyst' | 'viewer';

export type Permission =
  | 'case:read'
  | 'case:write'
  | 'case:delete'
  | 'evidence:read'
  | 'evidence:write'
  | 'evidence:gate'
  | 'document:read'
  | 'document:write'
  | 'document:sign'
  | 'agent:run'
  | 'agent:gate'
  | 'agent:cancel'
  | 'team:read'
  | 'team:write'
  | 'billing:read'
  | 'billing:write'
  | 'audit:read'
  | 'settings:write';

const RBAC_MATRIX: Record<Role, Permission[]> = {
  owner: [
    'case:read',
    'case:write',
    'case:delete',
    'evidence:read',
    'evidence:write',
    'evidence:gate',
    'document:read',
    'document:write',
    'document:sign',
    'agent:run',
    'agent:gate',
    'agent:cancel',
    'team:read',
    'team:write',
    'billing:read',
    'billing:write',
    'audit:read',
    'settings:write',
  ],
  attorney: [
    'case:read',
    'case:write',
    'evidence:read',
    'evidence:write',
    'evidence:gate',
    'document:read',
    'document:write',
    'document:sign',
    'agent:run',
    'agent:gate',
    'agent:cancel',
    'team:read',
    'audit:read',
  ],
  paralegal: [
    'case:read',
    'case:write',
    'evidence:read',
    'evidence:write',
    'document:read',
    'document:write',
    'agent:run',
    'team:read',
  ],
  analyst: ['case:read', 'evidence:read', 'document:read', 'audit:read', 'team:read'],
  viewer: ['case:read', 'evidence:read', 'document:read'],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return RBAC_MATRIX[role].includes(permission);
}

export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Role "${role}" lacks permission "${permission}"`);
  }
}

export class ForbiddenError extends Error {
  override readonly name = 'ForbiddenError';
  readonly status = 403;
}

export const ALL_PERMISSIONS: Permission[] = Array.from(
  new Set(Object.values(RBAC_MATRIX).flat()),
);
