'use client';

import { useState, type FormEvent } from 'react';
import type { FirmProfile } from '@/lib/store';

export function FirmSettingsForm({ firm }: { firm: FirmProfile }) {
  const [data, setData] = useState({
    displayName: firm.displayName,
    logoUrl: firm.logoUrl || '',
    bio: firm.bio || '',
    specialties: (firm.specialties || []).join(', '),
    languages: (firm.languages || []).join(', '),
    feePhilosophy: firm.feePhilosophy || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/firms/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: data.displayName,
          logoUrl: data.logoUrl || undefined,
          bio: data.bio || undefined,
          specialties: data.specialties
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          languages: data.languages
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          feePhilosophy: data.feePhilosophy || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || 'Could not save');
      }
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="vt-card accent" style={{ background: '#1a1a1a' }}>
      <div className="vt-field">
        <label>Display name</label>
        <input value={data.displayName} onChange={(e) => setData((d) => ({ ...d, displayName: e.target.value }))} />
      </div>
      <div className="vt-field">
        <label>Logo URL</label>
        <input value={data.logoUrl} onChange={(e) => setData((d) => ({ ...d, logoUrl: e.target.value }))} placeholder="https://" />
      </div>
      <div className="vt-field">
        <label>Bio</label>
        <textarea
          value={data.bio}
          onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
          rows={4}
          placeholder="Two sentences. Who you are, what you specialize in."
        />
      </div>
      <div className="vt-field">
        <label>Specialties (comma-separated)</label>
        <input value={data.specialties} onChange={(e) => setData((d) => ({ ...d, specialties: e.target.value }))} placeholder="O-1B, EB-1A, Electronic Music" />
      </div>
      <div className="vt-field">
        <label>Languages (comma-separated)</label>
        <input value={data.languages} onChange={(e) => setData((d) => ({ ...d, languages: e.target.value }))} placeholder="English, Spanish" />
      </div>
      <div className="vt-field">
        <label>Fee philosophy</label>
        <textarea
          value={data.feePhilosophy}
          onChange={(e) => setData((d) => ({ ...d, feePhilosophy: e.target.value }))}
          rows={3}
          placeholder="Flat-fee, no hourly billing. Premium processing included."
        />
      </div>
      {error ? <div style={{ color: '#ff5c8a', marginBottom: 12, fontSize: 13 }}>{error}</div> : null}
      {saved ? <div style={{ color: 'var(--accent)', marginBottom: 12, fontSize: 13 }}>Saved.</div> : null}
      <button type="submit" className="vt-cta" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
        {submitting ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
