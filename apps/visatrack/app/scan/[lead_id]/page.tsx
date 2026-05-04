'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Instagram,
  Loader2,
  ScanLine,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  USCIS_CRITERION_LABELS,
  USCIS_O1_CRITERIA,
  type GapSummary,
  type NormalizedScan,
  type UscisCriterion,
} from '@/db/schema';

type LeadRow = {
  id: string;
  ig_handle: string;
  status: 'new' | 'scanning' | 'scored' | 'error' | 'paid' | 'claimed';
  evidence_score: number | null;
  gap_summary: GapSummary | null;
  error_message: string | null;
};

type ScanRow = {
  normalized: NormalizedScan | null;
  raw_payload: { is_private?: boolean; full_name?: string; bio?: string } | null;
} | null;

type StatusResponse = {
  lead: LeadRow;
  scan: ScanRow;
};

export default function ScanPage({ params }: { params: Promise<{ lead_id: string }> }) {
  const { lead_id } = use(params);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [pollErr, setPollErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const r = await fetch(`/api/scan/status?lead_id=${encodeURIComponent(lead_id)}`, {
          cache: 'no-store',
        });
        if (!r.ok) {
          throw new Error(`status ${r.status}`);
        }
        const json = (await r.json()) as StatusResponse;
        if (cancelled) return;
        setStatus(json);
        setPollErr(null);
        if (json.lead.status === 'scanning' || json.lead.status === 'new') {
          timer = setTimeout(tick, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        setPollErr((err as Error).message);
        timer = setTimeout(tick, 3000);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [lead_id]);

  const lead = status?.lead;
  const isLoading = !lead || lead.status === 'scanning' || lead.status === 'new';

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-vt-magenta to-vt-cyan text-sm font-black text-white shadow-lg shadow-vt-magenta/30">
              VT
            </span>
            <span className="text-base font-bold tracking-tight">visatrack</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        {isLoading && <ScanningView handle={lead?.ig_handle} pollErr={pollErr} />}
        {lead?.status === 'error' && (
          <ErrorView handle={lead.ig_handle} message={lead.error_message} />
        )}
        {lead?.status === 'scored' && status && <ScoredView status={status} />}
        {(lead?.status === 'paid' || lead?.status === 'claimed') && status && (
          <ScoredView status={status} />
        )}
      </section>
    </main>
  );
}

function ScanningView({ handle, pollErr }: { handle?: string; pollErr: string | null }) {
  return (
    <Card className="ring-gradient-vt p-12 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-vt-cyan/15 text-vt-cyan">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">
        Scanning {handle ? `@${handle}` : 'your Instagram'}…
      </h1>
      <p className="mt-4 text-muted-foreground">
        Logging in, pulling your profile, classifying captions against 8 USCIS criteria.
        This usually takes 20–40 seconds.
      </p>
      <div className="mx-auto mt-10 max-w-md space-y-3 text-left text-sm">
        <Step active label="Connecting to Instagram" />
        <Step active label="Pulling profile + recent posts" />
        <Step active label="Classifying captions vs USCIS O-1 criteria" />
        <Step label="Building your scorecard" />
      </div>
      {pollErr && (
        <p className="mt-6 text-xs text-muted-foreground">
          (poll: {pollErr} — retrying)
        </p>
      )}
    </Card>
  );
}

function Step({ active, label }: { active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {active ? (
        <Loader2 className="h-4 w-4 animate-spin text-vt-cyan" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-border" />
      )}
      <span className={active ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function ErrorView({ handle, message }: { handle: string; message: string | null }) {
  const friendly = useMemo(() => {
    if (!message) return 'Something went wrong on our end. Try again in a minute.';
    if (message.startsWith('account_not_found')) {
      return `We could not find @${handle} on Instagram. Double-check spelling — no @, no spaces.`;
    }
    if (message.startsWith('account_private')) {
      return `@${handle} is private. We only scan public profiles for now.`;
    }
    if (message.startsWith('rate_limited')) {
      return 'Instagram is throttling us. Try again in a few minutes.';
    }
    if (message.startsWith('login_required') || message.startsWith('login_failed')) {
      return "Our scanner couldn't authenticate with Instagram right now. Engineering has been pinged — try again shortly.";
    }
    return message;
  }, [handle, message]);

  return (
    <Card className="border-destructive/40 p-12 text-center">
      <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-black tracking-tight md:text-4xl">Scan failed</h1>
      <p className="mt-4 text-muted-foreground">{friendly}</p>
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/">Try a different handle</Link>
        </Button>
      </div>
      {message && (
        <p className="mt-6 font-mono text-[11px] text-muted-foreground/70">code: {message}</p>
      )}
    </Card>
  );
}

function ScoredView({ status }: { status: StatusResponse }) {
  const lead = status.lead;
  const scan = status.scan;
  const score = lead.evidence_score ?? 0;
  const gap = lead.gap_summary;
  const norm = scan?.normalized ?? null;

  const verdict = scoreVerdict(score);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant={verdict.tone}>Evidence Scan · @{lead.ig_handle}</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Your USCIS evidence score
        </h1>
        <p className="mt-3 text-muted-foreground">
          Heuristic v1 — built from your last {norm?.scrapedPostCount ?? 0} Instagram posts.
        </p>
      </div>

      <Card className="ring-gradient-vt overflow-hidden">
        <div className="grid items-center gap-6 p-10 md:grid-cols-[auto_1fr]">
          <div className="text-center md:text-left">
            <div className="text-7xl font-black leading-none text-gradient-vt md:text-8xl">
              {score}
            </div>
            <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
              out of 100
            </div>
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{verdict.headline}</div>
            <p className="mt-2 text-muted-foreground">{verdict.body}</p>
          </div>
        </div>
        {norm && (
          <div className="grid grid-cols-2 gap-px bg-border/40 md:grid-cols-4">
            <Stat label="Followers" value={fmt(norm.followerCount)} />
            <Stat label="Posts (total)" value={fmt(norm.postCount)} />
            <Stat label="Avg likes" value={fmt(norm.avgLikes)} />
            <Stat label="Avg comments" value={fmt(norm.avgComments)} />
          </div>
        )}
      </Card>

      <Card className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <ScanLine className="h-5 w-5 text-vt-cyan" />
          <h2 className="text-2xl font-black tracking-tight">USCIS O-1 criteria scorecard</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          USCIS requires evidence of <strong className="text-foreground">3 of 8</strong>{' '}
          criteria. Below: what we found from your IG alone.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {USCIS_O1_CRITERIA.map((c) => (
            <CriterionRow key={c} criterion={c} gap={gap} />
          ))}
        </div>
        {gap?.notes && (
          <div className="mt-6 rounded-xl border border-vt-cyan/20 bg-vt-cyan/5 p-4 text-sm text-vt-cyan">
            {gap.notes}
          </div>
        )}
      </Card>

      <Card className="ring-gradient-vt overflow-hidden p-10 text-center">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-vt-magenta/15 text-vt-magenta">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-3xl font-black tracking-tight">
          Lock it in. Get the full Evidence Pack.
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          We deep-scrape TikTok, YouTube, and 200+ press outlets. We label every exhibit
          to a USCIS criterion. We hand you a dossier your lawyer can file as-is.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="xl"
            onClick={() =>
              alert('Coming soon: Stripe checkout. We will email you when this is live.')
            }
          >
            Upgrade to Standard — $497
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/">
              <Instagram className="h-5 w-5" />
              Scan another account
            </Link>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Risk reversal: if USCIS rejects on evidence quality, we rebuild your dossier free.
        </p>
      </Card>
    </div>
  );
}

function CriterionRow({
  criterion,
  gap,
}: {
  criterion: UscisCriterion;
  gap: GapSummary | null;
}) {
  const met = !!gap?.met.includes(criterion);
  const links = gap?.evidence?.[criterion] ?? [];
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        met ? 'border-vt-lime/30 bg-vt-lime/[0.04]' : 'border-destructive/30 bg-destructive/[0.04]'
      }`}
    >
      {met ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-vt-lime" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-bold">{USCIS_CRITERION_LABELS[criterion]}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {met
            ? `Evidence found in ${links.length || 'your'} post${links.length === 1 ? '' : 's'}`
            : 'Gap — not found in IG. May exist in TikTok / press / contracts.'}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background px-6 py-5 text-center">
      <div className="text-xl font-black md:text-2xl">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function scoreVerdict(score: number): {
  tone: 'lime' | 'magenta' | 'cyan';
  headline: string;
  body: string;
} {
  if (score >= 75) {
    return {
      tone: 'lime',
      headline: 'You are O-1 ready.',
      body: "Your IG alone surfaces strong USCIS-grade evidence. We can have a filing-ready dossier in 2 weeks.",
    };
  }
  if (score >= 50) {
    return {
      tone: 'magenta',
      headline: 'Striking distance.',
      body: 'You hit several USCIS criteria. The gaps are typical — TikTok, brand-deal contracts, and press will close them.',
    };
  }
  return {
    tone: 'cyan',
    headline: 'Early but workable.',
    body: 'Your IG signal is light right now. We can map a 3–6 month plan to bridge the evidence gaps before you file.',
  };
}
