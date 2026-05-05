'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function BidActions({ bidId }: { bidId: string }) {
  const router = useRouter();
  const [working, setWorking] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const act = async (verb: 'accept' | 'decline') => {
    setError(null);
    setWorking(verb);
    try {
      const res = await fetch(`/api/bids/${bidId}/${verb}`, { method: 'POST' });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error || 'Action failed');
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="vt-card accent">
      <h3>Decide on this bid</h3>
      <p style={{ color: 'var(--ink-2)', margin: '0 0 18px', fontSize: 14 }}>
        Accepting will share your contact details with this firm, decline all other open bids,
        and unlock your full dossier.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="vt-cta"
          disabled={!!working}
          onClick={() => act('accept')}
          style={{ flex: 1, justifyContent: 'center', minWidth: 200 }}
        >
          {working === 'accept' ? 'Matching…' : 'Accept this firm →'}
        </button>
        <button
          className="vt-btn danger"
          disabled={!!working}
          onClick={() => act('decline')}
          style={{ flex: 1, justifyContent: 'center', minWidth: 160 }}
        >
          {working === 'decline' ? 'Declining…' : 'Decline'}
        </button>
      </div>
      {error ? <div style={{ color: '#ff5c8a', marginTop: 12, fontSize: 13 }}>{error}</div> : null}
    </div>
  );
}
