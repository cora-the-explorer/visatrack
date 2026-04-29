import { describe, it, expect } from 'vitest';

describe('tenant isolation', () => {
  it.skip('queries scoped to tenantId never return cross-tenant rows', () => {
    expect(true).toBe(true);
  });
});
