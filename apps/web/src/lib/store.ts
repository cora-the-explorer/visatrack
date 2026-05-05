// JSON-file-backed datastore for marketplace MVP.
// Mirrors the Drizzle schema in packages/db, but lets the demo run without Postgres.
// On first read it seeds from packages/db/src/seed-marketplace.ts data if the file is empty.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type ArtistAccount = {
  id: string;
  email: string;
  legalName?: string;
  stageName?: string;
  phone?: string;
  citizenship?: string;
  basedIn?: string;
  createdAt: string;
};

export type CriteriaCoverage = {
  awards: boolean;
  press: boolean;
  judging: boolean;
  originalContributions: boolean;
  authorship: boolean;
  leadingRole: boolean;
  highSalary: boolean;
  commercialSuccess: boolean;
};

export type EvidenceData = {
  press: { outlet: string; title: string; year: number; url?: string }[];
  charts: { name: string; rank: string; bar: number }[];
  social: { platform: string; metric: string; value: string }[];
  contracts: { event: string; amount: string }[];
  testimonials: { author: string; role: string; preview: string }[];
  briefSummary: string[];
  topPosts: { title: string; platform: string; views: string }[];
  brandDeals: { count: number; total: string; topPartner: string; topAmount: string };
  monetization: { item: string; status: string }[];
};

export type ArtistCaseStatus =
  | 'intake'
  | 'processing'
  | 'dossier_ready'
  | 'listed'
  | 'matched'
  | 'closed';

export type ArtistCase = {
  id: string;
  artistId: string;
  visaType: string;
  intakeData: Record<string, string>;
  evidenceData?: EvidenceData;
  evidenceScore?: number;
  criteriaCoverage?: CriteriaCoverage;
  status: ArtistCaseStatus;
  targetVisaDate?: string;
  location?: string;
  budgetBand?: string;
  briefNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type FirmStatus = 'pending' | 'approved' | 'suspended';

export type FirmProfile = {
  id: string;
  displayName: string;
  slug: string;
  logoUrl?: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  feePhilosophy?: string;
  casesHandled: number;
  status: FirmStatus;
  ailaMember: boolean;
  contactEmail: string;
  contactName?: string;
  appliedAt: string;
  approvedAt?: string;
};

export type BidStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export type FirmBid = {
  id: string;
  caseId: string;
  firmId: string;
  priceCents: number;
  timelineWeeks: number;
  pitch: string;
  sampleUrl?: string;
  status: BidStatus;
  submittedAt: string;
  decidedAt?: string;
};

export type MagicLinkToken = {
  id: string;
  email: string;
  role: 'artist' | 'firm' | 'admin';
  token: string;
  expiresAt: string;
  usedAt?: string;
  // for artist links, optionally remember the case id we created at intake
  caseId?: string;
};

export type Handoff = {
  id: string;
  caseId: string;
  firmId: string;
  acceptedBidId: string;
  introSentAt?: string;
  retainerUrl?: string;
  notes?: string;
  createdAt: string;
};

export type FirmWaitlistEntry = {
  id: string;
  firmName: string;
  contactName?: string;
  contactEmail: string;
  website?: string;
  ailaMember: boolean;
  casesLast12Mo?: number;
  appliedAt: string;
  status: FirmStatus;
};

export type StoreShape = {
  artists: ArtistAccount[];
  cases: ArtistCase[];
  firms: FirmProfile[];
  bids: FirmBid[];
  tokens: MagicLinkToken[];
  handoffs: Handoff[];
  waitlist: FirmWaitlistEntry[];
};

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'marketplace.json');

const empty = (): StoreShape => ({
  artists: [],
  cases: [],
  firms: [],
  bids: [],
  tokens: [],
  handoffs: [],
  waitlist: [],
});

let seeded = false;

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<StoreShape> {
  try {
    const txt = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(txt) as Partial<StoreShape>;
    return { ...empty(), ...parsed };
  } catch {
    return empty();
  }
}

async function writeStore(s: StoreShape) {
  await ensureDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(s, null, 2), 'utf8');
}

async function maybeAutoSeed(s: StoreShape): Promise<StoreShape> {
  if (seeded) return s;
  seeded = true;
  if (s.firms.length > 0) return s;
  const { buildSeed } = await import('./seed-data');
  const seedData = buildSeed();
  await writeStore(seedData);
  return seedData;
}

export const store = {
  async all(): Promise<StoreShape> {
    const s = await readStore();
    return maybeAutoSeed(s);
  },

  async update(mut: (s: StoreShape) => void): Promise<StoreShape> {
    const s = await readStore();
    const seededS = await maybeAutoSeed(s);
    mut(seededS);
    await writeStore(seededS);
    return seededS;
  },

  // Artists
  async upsertArtistByEmail(email: string, patch: Partial<ArtistAccount>): Promise<ArtistAccount> {
    const s = await readStore();
    await maybeAutoSeed(s);
    let a = s.artists.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!a) {
      a = {
        id: randomUUID(),
        email,
        createdAt: new Date().toISOString(),
        ...patch,
      };
      s.artists.push(a);
    } else {
      Object.assign(a, patch);
    }
    await writeStore(s);
    return a;
  },

  async getArtistByEmail(email: string): Promise<ArtistAccount | undefined> {
    const s = await this.all();
    return s.artists.find((x) => x.email.toLowerCase() === email.toLowerCase());
  },

  async getArtistById(id: string): Promise<ArtistAccount | undefined> {
    const s = await this.all();
    return s.artists.find((x) => x.id === id);
  },

  // Cases
  async createCase(c: Omit<ArtistCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArtistCase> {
    const now = new Date().toISOString();
    const created: ArtistCase = { ...c, id: randomUUID(), createdAt: now, updatedAt: now };
    await this.update((s) => {
      s.cases.push(created);
    });
    return created;
  },

  async getCase(id: string): Promise<ArtistCase | undefined> {
    const s = await this.all();
    return s.cases.find((c) => c.id === id);
  },

  async updateCase(id: string, patch: Partial<ArtistCase>): Promise<ArtistCase | undefined> {
    let updated: ArtistCase | undefined;
    await this.update((s) => {
      const c = s.cases.find((x) => x.id === id);
      if (!c) return;
      Object.assign(c, patch, { updatedAt: new Date().toISOString() });
      updated = c;
    });
    return updated;
  },

  async listCasesByArtist(artistId: string): Promise<ArtistCase[]> {
    const s = await this.all();
    return s.cases.filter((c) => c.artistId === artistId);
  },

  async listOpenCases(): Promise<ArtistCase[]> {
    const s = await this.all();
    return s.cases.filter((c) => c.status === 'listed');
  },

  // Firms
  async createFirm(f: Omit<FirmProfile, 'id' | 'appliedAt'>): Promise<FirmProfile> {
    const created: FirmProfile = {
      ...f,
      id: randomUUID(),
      appliedAt: new Date().toISOString(),
    };
    await this.update((s) => {
      s.firms.push(created);
    });
    return created;
  },

  async getFirm(id: string): Promise<FirmProfile | undefined> {
    const s = await this.all();
    return s.firms.find((f) => f.id === id);
  },

  async getFirmByEmail(email: string): Promise<FirmProfile | undefined> {
    const s = await this.all();
    return s.firms.find((f) => f.contactEmail.toLowerCase() === email.toLowerCase());
  },

  async updateFirm(id: string, patch: Partial<FirmProfile>): Promise<FirmProfile | undefined> {
    let out: FirmProfile | undefined;
    await this.update((s) => {
      const f = s.firms.find((x) => x.id === id);
      if (!f) return;
      Object.assign(f, patch);
      out = f;
    });
    return out;
  },

  async listApprovedFirms(): Promise<FirmProfile[]> {
    const s = await this.all();
    return s.firms.filter((f) => f.status === 'approved');
  },

  async listPendingFirms(): Promise<FirmProfile[]> {
    const s = await this.all();
    return s.firms.filter((f) => f.status === 'pending');
  },

  // Bids
  async createBid(b: Omit<FirmBid, 'id' | 'submittedAt'>): Promise<FirmBid> {
    const created: FirmBid = {
      ...b,
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    await this.update((s) => {
      s.bids.push(created);
    });
    return created;
  },

  async getBid(id: string): Promise<FirmBid | undefined> {
    const s = await this.all();
    return s.bids.find((b) => b.id === id);
  },

  async listBidsForCase(caseId: string): Promise<FirmBid[]> {
    const s = await this.all();
    return s.bids.filter((b) => b.caseId === caseId);
  },

  async listBidsByFirm(firmId: string): Promise<FirmBid[]> {
    const s = await this.all();
    return s.bids.filter((b) => b.firmId === firmId);
  },

  async updateBid(id: string, patch: Partial<FirmBid>): Promise<FirmBid | undefined> {
    let out: FirmBid | undefined;
    await this.update((s) => {
      const b = s.bids.find((x) => x.id === id);
      if (!b) return;
      Object.assign(b, patch);
      out = b;
    });
    return out;
  },

  // Magic link tokens
  async createMagicLink(t: Omit<MagicLinkToken, 'id'>): Promise<MagicLinkToken> {
    const created: MagicLinkToken = { ...t, id: randomUUID() };
    await this.update((s) => {
      s.tokens.push(created);
    });
    return created;
  },

  async findToken(token: string): Promise<MagicLinkToken | undefined> {
    const s = await this.all();
    return s.tokens.find((t) => t.token === token);
  },

  async markTokenUsed(token: string) {
    await this.update((s) => {
      const t = s.tokens.find((x) => x.token === token);
      if (t) t.usedAt = new Date().toISOString();
    });
  },

  // Handoffs
  async createHandoff(h: Omit<Handoff, 'id' | 'createdAt'>): Promise<Handoff> {
    const created: Handoff = { ...h, id: randomUUID(), createdAt: new Date().toISOString() };
    await this.update((s) => {
      s.handoffs.push(created);
    });
    return created;
  },

  async getHandoffForCase(caseId: string): Promise<Handoff | undefined> {
    const s = await this.all();
    return s.handoffs.find((h) => h.caseId === caseId);
  },

  // Waitlist
  async createWaitlist(
    e: Omit<FirmWaitlistEntry, 'id' | 'appliedAt' | 'status'>,
  ): Promise<FirmWaitlistEntry> {
    const created: FirmWaitlistEntry = {
      ...e,
      id: randomUUID(),
      appliedAt: new Date().toISOString(),
      status: 'pending',
    };
    await this.update((s) => {
      s.waitlist.push(created);
    });
    return created;
  },
};
