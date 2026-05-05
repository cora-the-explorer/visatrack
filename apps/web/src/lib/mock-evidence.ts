// Deterministic mock evidence generator. Seeded by case id so re-renders are stable.
// Returns the evidence_data shape the dossier UI consumes (mirrors visatrack-ai/results.html).

import type { CriteriaCoverage, EvidenceData } from './store';

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const PRESS_OUTLETS = [
  'Mixmag',
  'Resident Advisor',
  'DJ Mag',
  'Pitchfork',
  'Tubefilter',
  'Hypebeast',
  'Insider',
  'Fader',
  'Complex',
  'Billboard',
  'Stereogum',
  'Variety',
];

const CHART_NAMES_BY_PLATFORM: Record<string, string[]> = {
  'DJ / Electronic': ['Beatport Global Rank', 'RA DJ Rank (Tech House)', '1001 Tracklists'],
  'Music / Recording Artist': [
    'Spotify Editorial Placements',
    'Apple Music Country Charts',
    'Shazam Top Discoveries',
  ],
  YouTube: ['Tubefilter Global Rank', 'Social Blade Rank', 'YouTube Trending'],
  TikTok: ['TikTok Creator Index', 'Tubular Labs Rank', 'Trending Sounds Lead'],
  Instagram: ['HypeAuditor Authority', 'CreatorIQ Rank', 'Vogue 100'],
  Twitch: ['Twitch Tracker Rank', 'Sully Gnome Top', 'StreamCharts Rank'],
};

const SOCIALS = [
  { platform: 'Spotify Monthly Listeners', unit: 'K' },
  { platform: 'Instagram Followers', unit: 'K' },
  { platform: 'TikTok Followers', unit: 'K' },
  { platform: 'YouTube Subscribers', unit: 'K' },
  { platform: 'SoundCloud Followers', unit: 'K' },
];

const TESTIMONIAL_VOICES = [
  { author: 'Dixon', role: 'Founder, Innervisions' },
  { author: 'Anna Lunoe', role: 'Festival Booker, HARD Events' },
  { author: 'Sasha Frere-Jones', role: 'Music Critic, formerly The New Yorker' },
  { author: 'Marie Claude', role: 'A&R Director, Ninja Tune' },
  { author: 'Hito Kanazawa', role: 'CEO, Tomorrowland Asia' },
  { author: 'Alia Schwartz', role: 'Head of Talent, Boiler Room' },
  { author: 'Kris Wright', role: 'Creator Partnerships, YouTube' },
  { author: 'Jamie Cole', role: 'EVP, WME Music' },
];

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function generateEvidence(
  caseId: string,
  stageName: string,
  genre: string,
  platform: string,
): EvidenceData {
  const r = rand(hashSeed(caseId));
  const chartNames =
    CHART_NAMES_BY_PLATFORM[platform] ?? CHART_NAMES_BY_PLATFORM['DJ / Electronic'] ?? [];
  const charts = chartNames.slice(0, 3).map((name) => {
    const rank = Math.floor(r() * 90) + 5;
    return { name, rank: `#${rank}`, bar: 100 - rank };
  });

  const pressCount = 8 + Math.floor(r() * 14);
  const press = Array.from({ length: 3 }).map((_, i) => {
    const outlet = PRESS_OUTLETS[Math.floor(r() * PRESS_OUTLETS.length)] ?? 'Mixmag';
    const titles = [
      `"${stageName} is the ${genre.toLowerCase()} act everyone's talking about"`,
      `"Inside the rise of ${stageName}"`,
      `"Why ${stageName} is rewriting the ${genre.toLowerCase()} playbook"`,
      `"${stageName} — Artist of the Week"`,
      `"${stageName} headlines our ${genre} spotlight"`,
    ];
    const idx = (Math.floor(r() * titles.length) + i) % titles.length;
    return {
      outlet,
      title: titles[idx] ?? `"Profile of ${stageName}"`,
      year: 2024 + Math.floor(r() * 2),
    };
  });

  const social = SOCIALS.map((s) => {
    const value = Math.floor(r() * 4_500_000) + 80_000;
    return { platform: s.platform, metric: 'followers', value: fmtNum(value) };
  });

  const events = [
    'Tomorrowland Main Stage 2025',
    'Ultra Miami 2025',
    'Boiler Room São Paulo',
    'Awakenings Festival (3 dates)',
    'Coachella Mojave Stage',
    'Primavera Sound Barcelona',
    'Glastonbury Park Stage',
  ];
  const contracts = events.slice(0, 4).map((event) => ({
    event,
    amount: `$${(Math.floor(r() * 70) + 18) * 1000}`,
  }));

  const testimonials = TESTIMONIAL_VOICES.slice(0, 3).map((v) => ({
    author: v.author,
    role: v.role,
    preview: `In my time working with ${stageName}, I have rarely encountered a ${genre.toLowerCase()} act with such a combination of technical mastery, international recognition, and consistent demand. They command premium fees across every market…`,
  }));

  const briefSummary = [
    'Criterion 1 — Lead/starring role: documented across festival lineups and headline tours.',
    'Criterion 2 — National/intl recognition: chart placements + 9 international press features.',
    'Criterion 3 — Critical reviews: 4 long-form features in tier-1 publications.',
    'Criterion 4 — Commercial success: chart positions, streaming volume, ticket revenue.',
    'Criterion 5 — Recognition by experts: 8 testimonial letters (3 in voice).',
    'Criterion 6 — High salary: contracts averaging well above genre median.',
    'Criterion 7 — Original contributions: production credits + label catalog.',
    'Criterion 8 — Display at major venues: festival main stages 2024–25.',
  ];

  const topPosts = [
    {
      title: `"GRWM — ${genre} stage" (TikTok)`,
      platform: 'TikTok',
      views: `${(Math.floor(r() * 60) + 24).toFixed(1)}M views`,
    },
    {
      title: `"Behind the booth — ${stageName} live"`,
      platform: 'YouTube',
      views: `${(Math.floor(r() * 18) + 6).toFixed(1)}M views`,
    },
    {
      title: `"Studio session — ${genre}"`,
      platform: 'Instagram',
      views: `${(Math.floor(r() * 12) + 3).toFixed(1)}M views`,
    },
  ];

  const dealTotal = (Math.floor(r() * 600) + 120) * 1000;
  const partners = ['Nike', 'Spotify', 'Apple', 'YouTube', 'Adidas'] as const;
  const brandDeals = {
    count: Math.floor(r() * 12) + 6,
    total: `$${dealTotal.toLocaleString('en-US')}`,
    topPartner: partners[Math.floor(r() * partners.length)] ?? 'Nike',
    topAmount: `$${(Math.floor(r() * 60) + 35) * 1000}`,
  };

  const monetization = [
    { item: 'YouTube Partner Program', status: 'Verified' },
    { item: 'TikTok Creator Fund + Creativity Program', status: 'Verified' },
    { item: 'Avg monthly platform revenue', status: `$${(Math.floor(r() * 30) + 8) * 1000}` },
  ];

  // augment last press item to reflect the count visible elsewhere
  const last = press[2];
  if (last) {
    press[2] = { ...last, title: `${last.title} (+ ${pressCount - 3} more hits)` };
  }

  return {
    press,
    charts,
    social,
    contracts,
    testimonials,
    briefSummary,
    topPosts,
    brandDeals,
    monetization,
  };
}

export function scoreEvidence(caseId: string): number {
  const r = rand(hashSeed(caseId + ':score'));
  return Math.floor(r() * 18) + 78; // 78–95
}

export function criteriaCoverage(caseId: string): CriteriaCoverage {
  const r = rand(hashSeed(caseId + ':criteria'));
  return {
    awards: r() > 0.4,
    press: true,
    judging: r() > 0.7,
    originalContributions: r() > 0.3,
    authorship: r() > 0.55,
    leadingRole: true,
    highSalary: r() > 0.25,
    commercialSuccess: r() > 0.2,
  };
}

export function coverageCount(c: CriteriaCoverage | undefined): number {
  if (!c) return 0;
  return Object.values(c).filter(Boolean).length;
}
