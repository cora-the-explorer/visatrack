'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function BidForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    price: '',
    weeks: '6',
    pitch: '',
    sampleUrl: '',
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const priceCents = Math.round(Number(data.price) * 100);
    if (!priceCents || priceCents <= 0) {
      setError('Enter a fee in USD.');
      return;
    }
    if (data.pitch.trim().length < 20) {
      setError('Write at least a couple of sentences for the pitch.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceCents,
          timelineWeeks: Number(data.weeks),
          pitch: data.pitch,
          sampleUrl: data.sampleUrl || undefined,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error || 'Could not submit bid');
      }
      router.push('/marketplace/sent');
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="vt-card accent" style={{ background: '#1a1a1a' }}>
      <h3>Submit your bid</h3>
      <div className="vt-field">
        <label>Fee (USD)</label>
        <input
          type="number"
          min={1}
          step={50}
          required
          value={data.price}
          onChange={(e) => setData((d) => ({ ...d, price: e.target.value }))}
          placeholder="9500"
        />
      </div>
      <div className="vt-field">
        <label>Timeline (weeks)</label>
        <input
          type="number"
          min={1}
          max={52}
          required
          value={data.weeks}
          onChange={(e) => setData((d) => ({ ...d, weeks: e.target.value }))}
        />
      </div>
      <div className="vt-field">
        <label>Pitch</label>
        <textarea
          required
          value={data.pitch}
          onChange={(e) => setData((d) => ({ ...d, pitch: e.target.value }))}
          placeholder="Why you're the right firm for this case…"
          rows={5}
        />
      </div>
      <div className="vt-field">
        <label>Sample work product (URL, optional)</label>
        <input
          type="url"
          value={data.sampleUrl}
          onChange={(e) => setData((d) => ({ ...d, sampleUrl: e.target.value }))}
          placeholder="https://"
        />
      </div>
      {error ? <div style={{ color: '#ff5c8a', marginBottom: 12, fontSize: 13 }}>{error}</div> : null}
      <button type="submit" className="vt-cta" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
        {submitting ? 'Sending…' : 'Submit bid →'}
      </button>
    </form>
  );
}
