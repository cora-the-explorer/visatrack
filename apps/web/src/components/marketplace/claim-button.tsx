'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

export function ClaimButton({
  caseId,
  unlockFeeCents,
  block,
}: {
  caseId: string;
  unlockFeeCents: number;
  block?: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/claim`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not claim');
      router.push('/marketplace/claimed');
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'block' }}>
      <button
        type="button"
        className="vt-cta"
        disabled={submitting}
        onClick={claim}
        style={{
          width: block ? '100%' : undefined,
          justifyContent: 'center',
          minWidth: 200,
        }}
      >
        {submitting ? 'Claiming…' : `Claim (${fmt$(unlockFeeCents)}) →`}
      </button>
      {error ? (
        <div style={{ color: '#ff5c8a', marginTop: 12, fontSize: 13 }}>{error}</div>
      ) : null}
    </div>
  );
}
