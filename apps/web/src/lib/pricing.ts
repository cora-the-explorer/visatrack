// Single source of truth for all VisaTrack demo pricing (cents).
// Mirrors visatrack-pricing-model.md §1–§5.
// Stripe wiring is Track B; Track A demo just records amounts on rows.

export const PRICING = {
  audit: {
    standard: 1900,
    concierge: 4900,
  },
  audit_addons: {
    manager_kit: 1900,
    express_evidence: 2900,
    relist_boost: 2900,
    re_audit: 900,
  },
  case_unlock_by_band: {
    low: 30000,
    medium: 40000,
    high: 50000,
  },
  console_sub: {
    starter: 20000,
    growth: 30000,
    practice: 40000,
  },
} as const;

export type AuditTier = keyof typeof PRICING.audit;
export type AuditAddonKind = keyof typeof PRICING.audit_addons;
export type PricingBandKey = keyof typeof PRICING.case_unlock_by_band;

// Preview window: free preview lasts 48h before re-locking.
export const PREVIEW_WINDOW_MS = 48 * 60 * 60 * 1000;
// Audit validity: 90d from purchase.
export const AUDIT_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

export function auditPriceCents(tier: AuditTier): number {
  return PRICING.audit[tier];
}

export function addonPriceCents(kind: AuditAddonKind): number {
  return PRICING.audit_addons[kind];
}

export function bandUnlockFeeCents(band: PricingBandKey): number {
  return PRICING.case_unlock_by_band[band];
}
