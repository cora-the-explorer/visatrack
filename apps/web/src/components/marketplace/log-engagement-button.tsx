'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogEngagementButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const log = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/log-engagement`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not log engagement');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="vt-cta"
        onClick={log}
        disabled={submitting}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {submitting ? 'Logging…' : 'Log first engagement →'}
      </button>
      {error ? (
        <div style={{ color: '#ff5c8a', marginTop: 12, fontSize: 13 }}>{error}</div>
      ) : null}
    </div>
  );
}
