'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Instagram, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type Variant = 'default' | 'compact';

export function ScanForm({
  variant = 'default',
  className,
  buttonLabel = 'Get Your Free Evidence Scan',
}: {
  variant?: Variant;
  className?: string;
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = handle.trim().replace(/^@/, '').toLowerCase();
    if (!/^[a-z0-9._]{1,30}$/.test(cleaned)) {
      setError('Handle must be 1–30 chars: letters, numbers, dot, underscore.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/scan/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ig_handle: cleaned }),
      });
      const json = await r.json();
      if (!r.ok || !json.lead_id) {
        throw new Error(json.error ?? json.detail ?? `status ${r.status}`);
      }
      router.push(`/scan/${json.lead_id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'mx-auto w-full max-w-xl',
        isCompact ? 'space-y-2' : 'space-y-3',
        className,
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-2 rounded-2xl border border-border bg-card/70 p-2 shadow-xl shadow-black/30 backdrop-blur sm:flex-row sm:items-center',
        )}
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <Instagram className="h-5 w-5 shrink-0 text-vt-magenta" />
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="@yourhandle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            disabled={submitting}
            className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
            aria-label="Instagram handle"
          />
        </div>
        <Button
          type="submit"
          size={isCompact ? 'lg' : 'xl'}
          disabled={submitting || handle.trim().length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Starting scan…
            </>
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          No password. We use a public-profile scan — your DMs and private posts are not touched.
        </p>
      )}
    </form>
  );
}
