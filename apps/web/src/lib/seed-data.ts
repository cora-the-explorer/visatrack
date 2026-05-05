// Deterministic seed used both by the auto-seeder and packages/db/src/seed-marketplace.ts.
// Three approved firms + five in-flight cases at various stages.
import { randomUUID } from 'node:crypto';
import { generateEvidence, scoreEvidence, criteriaCoverage } from './mock-evidence';
import type { ArtistAccount, ArtistCase, FirmProfile, FirmBid, StoreShape } from './store';

const fixedIds = {
  firmA: '11111111-1111-4111-8111-111111111111',
  firmB: '22222222-2222-4222-8222-222222222222',
  firmC: '33333333-3333-4333-8333-333333333333',
  artist1: 'a1111111-1111-4111-8111-111111111111',
  artist2: 'a2222222-2222-4222-8222-222222222222',
  artist3: 'a3333333-3333-4333-8333-333333333333',
  artist4: 'a4444444-4444-4444-8444-444444444444',
  artist5: 'a5555555-5555-4555-8555-555555555555',
  case1: 'c1111111-1111-4111-8111-111111111111',
  case2: 'c2222222-2222-4222-8222-222222222222',
  case3: 'c3333333-3333-4333-8333-333333333333',
  case4: 'c4444444-4444-4444-8444-444444444444',
  case5: 'c5555555-5555-4555-8555-555555555555',
};

const NOW = new Date('2026-05-04T12:00:00Z').toISOString();
const MS_DAY = 86_400_000;
const offset = (days: number) => new Date(Date.parse(NOW) + days * MS_DAY).toISOString();

export function buildSeed(): StoreShape {
  const firms: FirmProfile[] = [
    {
      id: fixedIds.firmA,
      displayName: 'Aperture Immigration',
      slug: 'aperture-immigration',
      bio: 'Boutique O-1B / EB-1A practice for touring DJs, electronic artists, and independent musicians. We file fast and we file clean.',
      specialties: ['O-1B', 'P-1B', 'EB-1A', 'Electronic Music'],
      languages: ['English', 'Spanish', 'Portuguese'],
      feePhilosophy: 'Flat-fee, no hourly billing. Premium processing included.',
      casesHandled: 142,
      status: 'approved',
      ailaMember: true,
      contactEmail: 'sam@aperture-immigration.com',
      contactName: 'Sam Reyes',
      appliedAt: offset(-180),
      approvedAt: offset(-178),
    },
    {
      id: fixedIds.firmB,
      displayName: 'North Star Visa Group',
      slug: 'north-star',
      bio: 'Founded by two ex-USCIS adjudicators. We know exactly what extraordinary looks like on paper because we used to grade it.',
      specialties: ['O-1B', 'O-2', 'Creators', 'YouTubers'],
      languages: ['English', 'Mandarin'],
      feePhilosophy: 'Fixed fee + success bonus. We win when you win.',
      casesHandled: 89,
      status: 'approved',
      ailaMember: true,
      contactEmail: 'jen@northstarvisa.com',
      contactName: 'Jennifer Wu',
      appliedAt: offset(-120),
      approvedAt: offset(-119),
    },
    {
      id: fixedIds.firmC,
      displayName: 'Midnight Counsel LLP',
      slug: 'midnight-counsel',
      bio: 'Twenty-year veterans. We file the dossier you bring us and never recycle the same petition twice.',
      specialties: ['O-1B', 'Influencers', 'Brand Talent'],
      languages: ['English', 'French'],
      feePhilosophy: 'Tiered pricing, transparent retainer. White-glove service.',
      casesHandled: 311,
      status: 'approved',
      ailaMember: true,
      contactEmail: 'priya@midnightcounsel.com',
      contactName: 'Priya Krishnan',
      appliedAt: offset(-300),
      approvedAt: offset(-298),
    },
  ];

  const artists: ArtistAccount[] = [
    {
      id: fixedIds.artist1,
      email: 'demo+kira@visatrack.test',
      legalName: 'Kira Tanaka',
      stageName: 'KIRA TNK',
      phone: '+44 7700 900111',
      citizenship: 'Japan',
      basedIn: 'Berlin',
      createdAt: offset(-12),
    },
    {
      id: fixedIds.artist2,
      email: 'demo+marco@visatrack.test',
      legalName: 'Marco Aceves',
      stageName: 'CIUDAD',
      phone: '+52 55 1234 5678',
      citizenship: 'Mexico',
      basedIn: 'Mexico City',
      createdAt: offset(-9),
    },
    {
      id: fixedIds.artist3,
      email: 'demo+amelia@visatrack.test',
      legalName: 'Amelia Okonkwo',
      stageName: 'ame.studio',
      phone: '+44 7700 900222',
      citizenship: 'United Kingdom',
      basedIn: 'London',
      createdAt: offset(-6),
    },
    {
      id: fixedIds.artist4,
      email: 'demo+leo@visatrack.test',
      legalName: 'Leonardo Bonetti',
      stageName: 'LEONI',
      phone: '+39 333 1234567',
      citizenship: 'Italy',
      basedIn: 'Milan',
      createdAt: offset(-4),
    },
    {
      id: fixedIds.artist5,
      email: 'demo+nia@visatrack.test',
      legalName: 'Nia Patel',
      stageName: 'NIA·P',
      phone: '+91 98 7654 3210',
      citizenship: 'India',
      basedIn: 'Mumbai',
      createdAt: offset(-1),
    },
  ];

  const intakeBase = (overrides: Record<string, string>): Record<string, string> => ({
    legal_name: '',
    stage_name: '',
    email: '',
    citizenship: '',
    based: '',
    primary_platform: 'DJ / Electronic',
    genre: 'House',
    years_active: '8',
    total_followers: '420000',
    monthly_reach: '11000000',
    biggest_brand_deal: '$45,000',
    brand_partners: 'Nike, SeatGeek, Spotify',
    labels: 'Innervisions, Permanent Vacation',
    big_gigs: 'Coachella 2025, Boiler Room São Paulo, Awakenings',
    youtube: '',
    tiktok: '',
    instagram: '',
    spotify: '',
    soundcloud: '',
    beatport: '',
    ra: '',
    top_content_url: '',
    top_content_views: '24,000,000',
    monthly_creator_revenue: '$18,500',
    press: 'https://mixmag.net/feature/...',
    avg_fee: '$12,000',
    top_fee: '$45,000',
    annual_revenue: '$640,000',
    brand_deals_count: '14',
    references: 'Dixon — Innervisions',
    notes: '',
    ...overrides,
  });

  const cases: ArtistCase[] = [
    {
      // Case 1 — Listed, 2 bids in
      id: fixedIds.case1,
      artistId: fixedIds.artist1,
      visaType: 'O-1B',
      intakeData: intakeBase({
        legal_name: 'Kira Tanaka',
        stage_name: 'KIRA TNK',
        email: 'demo+kira@visatrack.test',
        citizenship: 'Japan',
        based: 'Berlin',
        primary_platform: 'DJ / Electronic',
        genre: 'Tech House',
      }),
      evidenceData: generateEvidence(fixedIds.case1, 'KIRA TNK', 'Tech House', 'DJ / Electronic'),
      evidenceScore: scoreEvidence(fixedIds.case1),
      criteriaCoverage: criteriaCoverage(fixedIds.case1),
      status: 'listed',
      targetVisaDate: offset(120),
      location: 'Berlin → Brooklyn',
      budgetBand: '$10–15k',
      briefNote:
        'Touring 30+ dates this year, need approved petition before Sept festival run. Beatport top-50, RA tech house top-15.',
      createdAt: offset(-12),
      updatedAt: offset(-3),
    },
    {
      // Case 2 — Listed, no bids yet (fresh)
      id: fixedIds.case2,
      artistId: fixedIds.artist2,
      visaType: 'O-1B',
      intakeData: intakeBase({
        legal_name: 'Marco Aceves',
        stage_name: 'CIUDAD',
        email: 'demo+marco@visatrack.test',
        citizenship: 'Mexico',
        based: 'Mexico City',
        primary_platform: 'Music / Recording Artist',
        genre: 'Latin Alternative',
      }),
      evidenceData: generateEvidence(
        fixedIds.case2,
        'CIUDAD',
        'Latin Alternative',
        'Music / Recording Artist',
      ),
      evidenceScore: scoreEvidence(fixedIds.case2),
      criteriaCoverage: criteriaCoverage(fixedIds.case2),
      status: 'listed',
      targetVisaDate: offset(180),
      location: 'CDMX → Los Angeles',
      budgetBand: '$5–10k',
      briefNote:
        'Just signed 12-month US tour. Sony Music co-release Q3. Need filing within 60 days.',
      createdAt: offset(-9),
      updatedAt: offset(-1),
    },
    {
      // Case 3 — Dossier ready but not listed yet
      id: fixedIds.case3,
      artistId: fixedIds.artist3,
      visaType: 'O-1B',
      intakeData: intakeBase({
        legal_name: 'Amelia Okonkwo',
        stage_name: 'ame.studio',
        email: 'demo+amelia@visatrack.test',
        citizenship: 'United Kingdom',
        based: 'London',
        primary_platform: 'YouTube',
        genre: 'Beauty / Lifestyle',
      }),
      evidenceData: generateEvidence(
        fixedIds.case3,
        'ame.studio',
        'Beauty',
        'YouTube',
      ),
      evidenceScore: scoreEvidence(fixedIds.case3),
      criteriaCoverage: criteriaCoverage(fixedIds.case3),
      status: 'dossier_ready',
      createdAt: offset(-6),
      updatedAt: offset(-6),
    },
    {
      // Case 4 — Matched (already accepted a bid)
      id: fixedIds.case4,
      artistId: fixedIds.artist4,
      visaType: 'O-1B',
      intakeData: intakeBase({
        legal_name: 'Leonardo Bonetti',
        stage_name: 'LEONI',
        email: 'demo+leo@visatrack.test',
        citizenship: 'Italy',
        based: 'Milan',
        primary_platform: 'Instagram',
        genre: 'Fashion',
      }),
      evidenceData: generateEvidence(fixedIds.case4, 'LEONI', 'Fashion', 'Instagram'),
      evidenceScore: scoreEvidence(fixedIds.case4),
      criteriaCoverage: criteriaCoverage(fixedIds.case4),
      status: 'matched',
      targetVisaDate: offset(90),
      location: 'Milan → New York',
      budgetBand: '$15k+',
      briefNote: 'Already shooting in NYC quarterly. Want premium processing.',
      createdAt: offset(-30),
      updatedAt: offset(-2),
    },
    {
      // Case 5 — Processing (just submitted intake)
      id: fixedIds.case5,
      artistId: fixedIds.artist5,
      visaType: 'O-1B',
      intakeData: intakeBase({
        legal_name: 'Nia Patel',
        stage_name: 'NIA·P',
        email: 'demo+nia@visatrack.test',
        citizenship: 'India',
        based: 'Mumbai',
        primary_platform: 'TikTok',
        genre: 'Comedy',
      }),
      status: 'processing',
      createdAt: offset(-1),
      updatedAt: offset(-1),
    },
  ];

  const bids: FirmBid[] = [
    {
      id: randomUUID(),
      caseId: fixedIds.case1,
      firmId: fixedIds.firmA,
      priceCents: 12_000_00,
      timelineWeeks: 6,
      pitch:
        'We have filed 14 tech house DJ petitions in the last 18 months — including two with Beatport rankings inside your range. Premium processing included.',
      status: 'pending',
      submittedAt: offset(-2),
    },
    {
      id: randomUUID(),
      caseId: fixedIds.case1,
      firmId: fixedIds.firmB,
      priceCents: 9_500_00,
      timelineWeeks: 8,
      pitch:
        'Ex-USCIS adjudicator on staff. We can pre-flight your dossier against the exact rubric your case will be graded on.',
      status: 'pending',
      submittedAt: offset(-1),
    },
    {
      id: randomUUID(),
      caseId: fixedIds.case4,
      firmId: fixedIds.firmC,
      priceCents: 18_500_00,
      timelineWeeks: 4,
      pitch:
        'White-glove fashion-talent practice. We have filed for runway and editorial talent at every Milan/Paris/NYC house.',
      status: 'accepted',
      submittedAt: offset(-15),
      decidedAt: offset(-2),
    },
  ];

  return {
    artists,
    cases,
    firms,
    bids,
    tokens: [],
    handoffs: bids[2]
      ? [
          {
            id: randomUUID(),
            caseId: fixedIds.case4,
            firmId: fixedIds.firmC,
            acceptedBidId: bids[2].id,
            introSentAt: offset(-2),
            notes: 'Intro sent. Awaiting countersigned engagement letter.',
            createdAt: offset(-2),
          },
        ]
      : [],
    waitlist: [],
  };
}

export const seedIds = fixedIds;
