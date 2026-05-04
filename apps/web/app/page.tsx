import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Users,
  Workflow,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Evidence Curator',
    body: "Scans the open web, your client's socials, and your firm's archive for press, awards, and proof. Each item is tagged by USCIS criteria and scored for strength.",
  },
  {
    icon: FileText,
    title: 'Petition Drafter',
    body: "Generates structured, citation-grounded petition letters in your firm's voice. Cites every fact to its source. Attorneys edit, never start from scratch.",
  },
  {
    icon: Workflow,
    title: 'Pipeline & Inbox',
    body: "A kanban view of every active case and a single inbox for AI drafts that need a human gate. Never lose track of what's waiting on you.",
  },
  {
    icon: Users,
    title: 'Artist Portal',
    body: 'Your clients see plain-language progress, upload documents in three taps, and message you directly. No more email chasing.',
  },
  {
    icon: MessageSquare,
    title: 'Expert Letter Drafter',
    body: "Drafts personalized letters of support based on each expert's real bio. Your reviewer signs off; the agent never sends without you.",
  },
  {
    icon: Shield,
    title: 'Audit & Compliance',
    body: 'Every AI action is logged with citations, tokens, and the human who approved it. Multi-tenant isolation; ABA-aware controls.',
  },
];

const TIERS = [
  {
    name: 'Starter',
    price: 299,
    blurb: 'Solo attorneys and 1-2 person firms.',
    features: [
      'Up to 10 active cases',
      'AI Evidence Curator',
      'AI Petition Drafter',
      'Artist portal (5 seats)',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: 699,
    blurb: 'Mid-sized firms scaling O-1B / P-1B volume.',
    features: [
      'Up to 50 active cases',
      'Everything in Starter',
      'RFE Responder agent',
      'Expert Letter Drafter',
      'Branded artist portal',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: 1499,
    blurb: 'High-volume firms and immigration practices.',
    features: [
      'Unlimited cases',
      'Everything in Growth',
      'Custom AI agents',
      'SSO + audit log export',
      'Dedicated success manager',
      'SLA-backed uptime',
    ],
    cta: 'Talk to Sales',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We cut petition drafting time from 12 hours to under 2. The AI cites everything to source — our review is faster than our old proofreading was.',
    name: 'Marcus Thorne',
    role: 'Partner, Thorne Immigration',
  },
  {
    quote:
      'Clients love the portal. We used to spend half our day chasing documents over email. Now they upload, we know.',
    name: 'Sara Jaso',
    role: 'Managing Attorney, Jaso & Co.',
  },
];

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white">
            S
          </span>
          <span className="text-base font-semibold tracking-tight">Visa Track</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-900">
            Features
          </a>
          <a href="#how" className="hover:text-slate-900">
            How it works
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/40 via-white to-white" />
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          Built for O-1B & P-1B firms
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
          The AI workspace for{' '}
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            extraordinary ability
          </span>{' '}
          immigration
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Visa Track drafts petitions, gathers evidence, and runs your client portal — so your
          attorneys spend their hours on judgment, not formatting.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pipeline"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300"
          >
            See it in action
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          14-day free trial · No credit card required · ABA-aware controls
        </p>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-500/10">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-3 bg-slate-50 p-4">
              {['Intake', 'Docs', 'Draft', 'RFE', 'Approved', 'Denied'].map((col, i) => (
                <div key={col} className="flex flex-col gap-2 rounded-xl bg-white p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {col}
                  </div>
                  {Array.from({ length: i === 1 ? 3 : i === 2 ? 2 : 1 }).map((_, j) => (
                    <div key={j} className="rounded-md border border-slate-100 p-2">
                      <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                      <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="border-y border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 text-center">
        <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Trusted by immigration teams in
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-base font-semibold text-slate-400">
          <span>New York</span>
          <span>Los Angeles</span>
          <span>London</span>
          <span>Berlin</span>
          <span>Tokyo</span>
          <span>São Paulo</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
          The platform
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-slate-900">
          Every step of the petition lifecycle
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          From the moment an artist signs the engagement letter to the day USCIS approves —
          AI agents that work the way an attorney does.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 transition hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Onboard your client in minutes',
      body: 'Conversational intake collects everything for the petition — and the artist portal is live the moment you create the case.',
    },
    {
      n: '02',
      title: 'AI gathers evidence',
      body: 'The Evidence Curator scans press, socials, charts, and your archive. Every item is categorized and scored against USCIS criteria.',
    },
    {
      n: '03',
      title: 'Draft, review, file',
      body: 'The Petition Drafter writes a citation-grounded letter. You edit, approve, and file — without the eight-hour copy-paste session.',
    },
  ];
  return (
    <section id="how" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            How it works
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            From engagement letter to filing in days
          </h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-slate-100 bg-white p-8">
              <div className="text-5xl font-black text-indigo-100">{s.n}</div>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-6 md:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
          >
            <div className="mb-4 flex gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-lg leading-relaxed text-slate-700">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                {t.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-indigo-50/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Pricing
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Simple, per-firm pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every plan includes the full AI agent suite. Pay for the volume your firm needs.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 transition ${
                tier.highlighted
                  ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-500/20'
                  : 'border-slate-100 bg-white'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tier.blurb}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tight text-slate-900">
                  ${tier.price}
                </span>
                <span className="text-sm font-medium text-slate-500">/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  tier.highlighted
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-12 text-center text-white md:p-16">
        <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
          Stop drafting petitions by hand
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
          Try Visa Track free for 14 days. Set up your first case in under 10 minutes.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-indigo-600 transition hover:bg-indigo-50"
        >
          Start free trial
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-black text-white">
            S
          </span>
          © {new Date().getFullYear()} Visa Track, Inc. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-900">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-900">
            Terms
          </a>
          <a href="#" className="hover:text-slate-900">
            Security
          </a>
        </div>
      </div>
    </footer>
  );
}
