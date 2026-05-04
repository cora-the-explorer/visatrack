import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Disc3,
  Flame,
  Music2,
  ScanLine,
  ShieldCheck,
  Star,
  Video,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScanForm } from '@/components/scan/scan-form';

export default function VisatrackHome() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <PainStrip />
      <WhoThisIsFor />
      <Offers />
      <ValueStack />
      <RiskReversal />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-vt-magenta to-vt-cyan text-sm font-black text-white shadow-lg shadow-vt-magenta/30">
            VT
          </span>
          <span className="text-base font-bold tracking-tight">visatrack</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#offers" className="hover:text-foreground">Offers</a>
          <a href="#how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <a
          href="#hero-scan"
          className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-vt-magenta to-vt-cyan px-4 text-xs font-semibold text-white shadow-lg shadow-vt-magenta/20 hover:brightness-110"
        >
          Free scan
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-vt-grid bg-[size:64px_64px] opacity-30" />
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center md:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-vt-magenta/30 bg-vt-magenta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vt-magenta">
          <Flame className="h-3.5 w-3.5" />
          Built for DJs, creators &amp; influencers
        </div>

        <h1 className="mx-auto max-w-4xl text-balance text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
          Get Your O-1 Visa Without Losing{' '}
          <span className="text-gradient-vt">6 Months and $25K</span> to a Lawyer Who Has
          Never Heard of TikTok
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          We scan your Instagram, TikTok, and press in <strong className="text-foreground">3 minutes</strong>{' '}
          and tell you exactly what evidence USCIS wants — then hand-build the dossier
          your lawyer files.
        </p>

        <div id="hero-scan" className="mt-10">
          <ScanForm buttonLabel="Get Your Free Evidence Scan" />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No credit card · 3-minute scan · Your data is yours, you can delete anytime
        </p>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 text-center">
          <Stat value="2,400+" label="creators scanned" />
          <Stat value="91%" label="approval rate (assisted)" />
          <Stat value="$3K avg" label="legal fees saved" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 px-3 py-4 backdrop-blur">
      <div className="text-2xl font-black text-gradient-vt md:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function PainStrip() {
  const items = [
    {
      icon: Music2,
      title: 'Touring DJs',
      body: 'Booked Berlin, LA, Tokyo this year. No clue if your residencies count as "leading role."',
    },
    {
      icon: Video,
      title: 'Creators 100K+',
      body: 'You went viral. USCIS wants press hits. Your lawyer wants $400/hr to Google you.',
    },
    {
      icon: Disc3,
      title: 'Brand-deal Influencers',
      body: 'Six-figure brand deals = "high remuneration." Nobody told the immigration firm that.',
    },
  ];
  return (
    <section className="border-y border-border/40 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-px bg-border/40 sm:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="bg-background p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-vt-cyan/30 bg-vt-cyan/10 text-vt-cyan">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-bold">{it.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WhoThisIsFor() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="cyan">Read this first</Badge>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Who this is for. Who it&apos;s not.
        </h2>
        <p className="mt-4 text-muted-foreground">
          We don&apos;t want your money if we can&apos;t get you the visa. Here&apos;s the line.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="ring-gradient-vt p-7">
          <div className="mb-4 inline-flex items-center gap-2 text-vt-lime">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">For you if</span>
          </div>
          <ul className="space-y-3 text-sm">
            <ForItem>You&apos;re a DJ touring internationally — confirmed gigs in 3+ countries</ForItem>
            <ForItem>You&apos;re a creator with 100K+ followers across IG, TikTok, or YouTube</ForItem>
            <ForItem>You&apos;ve done brand deals worth $5K+ each (or have one signed)</ForItem>
            <ForItem>You&apos;ve been featured in press, podcasts, or industry rankings</ForItem>
            <ForItem>You make money from your craft and want to live/work in the US legally</ForItem>
          </ul>
        </Card>
        <Card className="border-destructive/30 bg-destructive/[0.03] p-7">
          <div className="mb-4 inline-flex items-center gap-2 text-destructive">
            <X className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Not for you if</span>
          </div>
          <ul className="space-y-3 text-sm">
            <NotForItem>You&apos;re just starting out — under 10K followers, no paid bookings</NotForItem>
            <NotForItem>You want a green card or family visa (we only do O-1)</NotForItem>
            <NotForItem>You expect a 100% guarantee. We&apos;re honest: USCIS decides, not us.</NotForItem>
            <NotForItem>You want a $500 lawyer and a stamp on a form. Wrong product.</NotForItem>
          </ul>
        </Card>
      </div>
    </section>
  );
}

function ForItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-vt-lime" />
      <span>{children}</span>
    </li>
  );
}

function NotForItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-muted-foreground">
      <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <span>{children}</span>
    </li>
  );
}

function Offers() {
  const tiers = [
    {
      name: 'The Evidence Scan',
      price: 'FREE',
      tagline: 'See where you stand. No card.',
      cta: 'Start Free Scan',
      ctaHref: '#hero-scan',
      variant: 'outline' as const,
      features: [
        'Public IG profile scan in under a minute',
        'USCIS criteria scorecard (8 categories)',
        'Plain-English gap report',
        'Honest "are you ready" verdict',
      ],
      badge: 'Lite',
      badgeVariant: 'cyan' as const,
    },
    {
      name: 'The Evidence Pack',
      price: '$497',
      tagline: 'The whole portfolio. Receipt-style.',
      cta: 'Get the Pack',
      ctaHref: '#hero-scan',
      variant: 'default' as const,
      features: [
        'Multi-platform scrape: IG + TikTok + YouTube',
        'Press search across 200+ outlets',
        'Labeled exhibits per USCIS criterion',
        '3 expert letter templates (peer / promoter / publication)',
        'Matched to 3 vetted O-1 immigration firms',
        'You hand it to your lawyer. They thank you.',
      ],
      badge: 'Standard · Most picked',
      badgeVariant: 'magenta' as const,
      highlighted: true,
    },
    {
      name: 'The Done-For-You Petition',
      price: '$2,997',
      tagline: 'We file. You play your show.',
      cta: 'Talk to a Strategist',
      ctaHref: '#hero-scan',
      variant: 'lime' as const,
      features: [
        'Everything in the Evidence Pack',
        'AI-drafted petition letter, attorney-reviewed',
        'Matched immigration firm reviews & files for you',
        'Expert letter outreach (we email your peers, you approve)',
        'Direct strategist on Telegram — same-day replies',
        'White-glove from intake to USCIS receipt',
      ],
      badge: 'Full Dossier',
      badgeVariant: 'lime' as const,
    },
  ];

  return (
    <section id="offers" className="bg-card/20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="magenta">Three offers</Badge>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Pick your level. Start free.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every tier starts with the free scan. Upgrade only if you want us to do more.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlighted
                  ? 'ring-gradient-vt relative scale-[1.02] p-7 shadow-2xl shadow-vt-magenta/20'
                  : 'p-7'
              }
            >
              <Badge variant={tier.badgeVariant}>{tier.badge}</Badge>
              <h3 className="mt-4 text-2xl font-black">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tight">{tier.price}</span>
                {tier.price !== 'FREE' && (
                  <span className="text-sm text-muted-foreground">one-time</span>
                )}
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-vt-cyan" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={tier.variant} className="mt-8 w-full" size="lg">
                <a href={tier.ctaHref}>
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValueStack() {
  const stack = [
    { item: 'Multi-platform evidence scrape (IG + TikTok + YouTube)', value: 1500 },
    { item: 'Press search across 200+ music & culture outlets', value: 800 },
    { item: 'USCIS criteria scorecard with strength rankings', value: 600 },
    { item: 'Labeled exhibit set, USCIS-formatted', value: 1200 },
    { item: 'AI-drafted petition letter (attorney-reviewed)', value: 4500 },
    { item: '3 expert letter templates + outreach', value: 1500 },
    { item: 'Matched immigration firm — files for you', value: 3500 },
    { item: 'Same-day strategist on Telegram', value: 1200 },
    { item: 'Free rebuild if USCIS rejects on evidence quality', value: 1500 },
  ];
  const total = stack.reduce((s, x) => s + x.value, 0);
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="lime">Stack the value</Badge>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          What you actually get inside the Full Dossier
        </h2>
        <p className="mt-4 text-muted-foreground">
          Priced separately, this stack runs <strong className="text-foreground">${total.toLocaleString()}</strong>.
          You pay $2,997.
        </p>
      </div>

      <Card className="ring-gradient-vt mt-12 overflow-hidden">
        <div className="divide-y divide-border/60">
          {stack.map((row) => (
            <div
              key={row.item}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-vt-lime" />
                <span className="text-sm">{row.item}</span>
              </div>
              <span className="text-sm font-mono text-muted-foreground line-through decoration-destructive/60">
                ${row.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 bg-secondary/40 px-6 py-5">
            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Standalone value
            </div>
            <div className="font-mono text-2xl font-black line-through decoration-destructive/60">
              ${total.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 bg-vt-magenta/10 px-6 py-6">
            <div className="text-base font-bold uppercase tracking-wider text-vt-magenta">
              Your price today
            </div>
            <div className="text-3xl font-black text-gradient-vt md:text-4xl">$2,997</div>
          </div>
        </div>
      </Card>

      <div className="mt-8 text-center">
        <Button asChild size="xl">
          <a href="#hero-scan">
            Start with the free scan
            <ArrowRight className="h-5 w-5" />
          </a>
        </Button>
      </div>
    </section>
  );
}

function RiskReversal() {
  return (
    <section className="bg-card/30 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <Card className="ring-gradient-vt overflow-hidden p-10 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-vt-lime/15 text-vt-lime">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-3xl font-black tracking-tight md:text-4xl">
            Our spine-of-steel guarantee
          </h3>
          <p className="mt-4 text-lg text-muted-foreground">
            If USCIS rejects your petition on evidence quality,{' '}
            <strong className="text-foreground">we rebuild your dossier free</strong> and
            cover the refile prep. No legalese. No fine print.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            We can&apos;t promise USCIS will say yes — nobody honest can. We can promise
            we&apos;ll go to war with you if they don&apos;t.
          </p>
        </Card>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: 'DJ Marcus',
    role: 'Berlin / LA · house & techno',
    quote:
      'Three lawyers told me my Boiler Room set didn’t count as “extraordinary ability.” visatrack flagged 14 pieces of evidence those guys missed in an hour. Approved in 11 weeks.',
    initials: 'DM',
    color: 'from-vt-magenta to-vt-cyan',
  },
  {
    name: 'Sofia M.',
    role: 'TikTok creator · 1.2M followers',
    quote:
      'The scan literally pulled my brand deals from caption mentions and turned them into a “high remuneration” exhibit. My old immigration firm had no idea this was a thing.',
    initials: 'SM',
    color: 'from-vt-cyan to-vt-lime',
  },
  {
    name: 'Kai T.',
    role: 'YouTuber · gaming & tech',
    quote:
      'Got the Standard pack on a Tuesday. Sent the exhibits to the matched firm Wednesday. Petition was filed in 19 days. Felt illegal how fast it was.',
    initials: 'KT',
    color: 'from-vt-lime to-vt-magenta',
  },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="cyan">Real talk from real artists</Badge>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          They were stuck. Now they&apos;re here.
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="p-7">
            <div className="mb-4 flex gap-1 text-vt-lime">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="text-base leading-relaxed text-foreground">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-black text-white`}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-bold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </Card>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: 'I do not have press coverage. Am I cooked?',
    a: "No. Press is one of eight USCIS criteria — you only need to satisfy three. Brand deals, leading roles in notable productions, high remuneration, and judging gigs all count. Our scan tells you which three you're closest to clearing, and exactly what to add to lock it in.",
  },
  {
    q: 'Will my immigration lawyer hate this?',
    a: "Most love it. We give them a labeled, USCIS-formatted exhibit set instead of a Google Drive of screenshots. Our top firm partners explicitly ask their clients to come through us first because it cuts their drafting time in half. If your lawyer would rather charge you for the scrape work themselves, you have your answer about that lawyer.",
  },
  {
    q: 'Is this legal advice?',
    a: 'No. visatrack is an evidence and prep service — not a law firm. We do not file petitions or give legal opinions. The Full Dossier tier matches you with a vetted, licensed immigration attorney who reviews and files everything. They are the lawyer of record.',
  },
  {
    q: 'How do you handle my Instagram data?',
    a: 'We never ask for your password. You give us your public handle. Our server reads your public profile and your most recent posts the same way any logged-in IG user can — no DMs, no private accounts, no impersonation, no posting on your behalf. We store the scraped JSON in our database so we can rebuild the scorecard on demand, and you can delete your lead and every byte tied to it from your dashboard with one click.',
  },
  {
    q: 'What about TikTok creators? You said TikTok in the headline.',
    a: 'TikTok scraping is included in the Standard ($497) and Full ($2,997) tiers. TikTok does not offer a clean public OAuth API for full creator data, so we use a combination of their public endpoint and manual review for TikTok-only creators. You provide your handle, we do the work.',
  },
  {
    q: 'Do you guarantee approval?',
    a: 'No, and run from anyone who does. USCIS makes the decision. What we guarantee is this: if your petition is rejected on evidence quality (not eligibility), we rebuild your dossier free for one refile. Our assisted approval rate is 91% — well above the industry average — but past results never guarantee future ones.',
  },
];

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="magenta">FAQ</Badge>
        <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          The questions you&apos;re actually asking
        </h2>
      </div>
      <Accordion type="single" collapsible className="mt-12">
        {FAQS.map((f, i) => (
          <AccordionItem key={f.q} value={`item-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Card className="ring-gradient-vt overflow-hidden p-12 text-center md:p-16">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-vt-cyan/30 bg-vt-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vt-cyan">
            <ScanLine className="h-3.5 w-3.5" />
            3 minutes · No credit card
          </div>
          <h2 className="mx-auto max-w-2xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Find out if you qualify <span className="text-gradient-vt">before</span> you
            wire $5K to a lawyer
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Drop your Instagram handle. Get your USCIS evidence scorecard. Decide what to do next.
          </p>
          <div className="mt-10">
            <ScanForm buttonLabel="Get Your Free Evidence Scan" />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            By scanning, you agree to our terms. We&apos;ll never post on your behalf.
          </p>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-vt-magenta to-vt-cyan text-[10px] font-black text-white">
            VT
          </span>
          © {new Date().getFullYear()} visatrack — not a law firm. Evidence prep only.
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Disclaimers</a>
        </div>
      </div>
    </footer>
  );
}
