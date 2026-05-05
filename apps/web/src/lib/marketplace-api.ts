// Shared API logic for marketplace routes.
// Route handlers in app/api/* are thin wrappers around these.
import { z } from 'zod';
import { store } from './store';
import { generateEvidence, scoreEvidence, criteriaCoverage } from './mock-evidence';
import { sendEmail, magicLinkEmail } from './email';
import { makeToken } from './session';

const baseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export async function issueMagicLink(opts: {
  email: string;
  role: 'artist' | 'firm' | 'admin';
  caseId?: string;
  heading?: string;
  body?: string;
}) {
  const token = makeToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  await store.createMagicLink({
    email: opts.email,
    role: opts.role,
    token,
    expiresAt,
    caseId: opts.caseId,
  });
  const url = `${baseUrl()}/api/auth/consume?token=${token}`;
  const { subject, html, text } = magicLinkEmail({
    url,
    heading:
      opts.heading ||
      (opts.role === 'firm'
        ? 'Open your VisaTrack firm console'
        : 'Sign in to your VisaTrack portal'),
    body: opts.body,
    cta: opts.role === 'firm' ? 'Open firm console' : 'Open my portal',
  });
  await sendEmail({ to: opts.email, subject, html, text });
  return url;
}

export const intakeStartSchema = z.object({
  email: z.string().email(),
  legal_name: z.string().optional(),
  stage_name: z.string().optional(),
  phone: z.string().optional(),
  citizenship: z.string().optional(),
  based: z.string().optional(),
});

export async function intakeStart(input: z.infer<typeof intakeStartSchema>) {
  const a = await store.upsertArtistByEmail(input.email, {
    email: input.email,
    legalName: input.legal_name,
    stageName: input.stage_name,
    phone: input.phone,
    citizenship: input.citizenship,
    basedIn: input.based,
  });
  const magicLink = await issueMagicLink({
    email: a.email,
    role: 'artist',
    heading: 'Your VisaTrack dossier is being built',
    body: 'Use this link to come back to your dossier and review firm bids whenever you want.',
  });
  return { artistId: a.id, magicLink };
}

export const intakeSubmitSchema = z.object({
  intake: z.record(z.string(), z.string()),
});

export async function intakeSubmit(input: z.infer<typeof intakeSubmitSchema>) {
  const intake = input.intake;
  if (!intake.email) throw new Error('email is required');
  const a = await store.upsertArtistByEmail(intake.email, {
    email: intake.email,
    legalName: intake.legal_name,
    stageName: intake.stage_name,
    phone: intake.phone,
    citizenship: intake.citizenship,
    basedIn: intake.based,
  });
  const created = await store.createCase({
    artistId: a.id,
    visaType: 'O-1B',
    intakeData: intake,
    status: 'processing',
  });
  return { caseId: created.id };
}

export async function finalizeCase(id: string) {
  const existing = await store.getCase(id);
  if (!existing) return null;
  if (existing.status !== 'processing' && existing.status !== 'intake') {
    return existing; // already finalized
  }
  const stage = existing.intakeData?.stage_name || existing.intakeData?.legal_name || 'Artist';
  const genre = existing.intakeData?.genre || 'House';
  const platform = existing.intakeData?.primary_platform || 'DJ / Electronic';
  const evidence = generateEvidence(id, stage, genre, platform);
  return store.updateCase(id, {
    evidenceData: evidence,
    evidenceScore: scoreEvidence(id),
    criteriaCoverage: criteriaCoverage(id),
    status: 'dossier_ready',
  });
}

export const listCaseSchema = z.object({
  targetVisaDate: z.string().optional(),
  location: z.string().optional(),
  budgetBand: z.string(),
  briefNote: z.string().optional(),
});

export async function listCase(id: string, input: z.infer<typeof listCaseSchema>) {
  const c0 = await store.getCase(id);
  if (!c0) throw new Error('case not found');
  await store.updateCase(id, {
    targetVisaDate: input.targetVisaDate,
    location: input.location,
    budgetBand: input.budgetBand,
    briefNote: input.briefNote,
    status: 'listed',
  });
  const artist = await store.getArtistById(c0.artistId);
  const stageName = artist?.stageName || artist?.legalName || 'an artist';
  const firms = await store.listApprovedFirms();
  await Promise.all(
    firms.map((f) =>
      sendEmail({
        to: f.contactEmail,
        subject: `New O-1B dossier listed — ${stageName}`,
        html: `<p>A new dossier just hit your VisaTrack inbox.</p><p>Stage name: <b>${stageName}</b><br/>Budget: ${input.budgetBand}<br/>Target: ${input.targetVisaDate || '—'}</p><p><a href="${baseUrl()}/marketplace/${id}">Open in marketplace →</a></p>`,
      }),
    ),
  );
  let magicLink: string | undefined;
  if (artist) {
    magicLink = await issueMagicLink({
      email: artist.email,
      role: 'artist',
      heading: 'Firms are reviewing your case',
      body: 'You can review every bid as it comes in. Most firms respond inside 48 hours.',
    });
  }
  return { magicLink };
}

export const submitBidSchema = z.object({
  firmId: z.string(),
  priceCents: z.number().int().positive(),
  timelineWeeks: z.number().int().positive(),
  pitch: z.string().min(20),
  sampleUrl: z.string().optional(),
});

export async function submitBid(caseId: string, input: z.infer<typeof submitBidSchema>) {
  const ac = await store.getCase(caseId);
  if (!ac) throw new Error('case not found');
  const firm = await store.getFirm(input.firmId);
  if (!firm) throw new Error('firm not found');
  if (firm.status !== 'approved') throw new Error('firm not approved');
  const bid = await store.createBid({
    caseId,
    firmId: firm.id,
    priceCents: input.priceCents,
    timelineWeeks: input.timelineWeeks,
    pitch: input.pitch,
    sampleUrl: input.sampleUrl,
    status: 'pending',
  });
  const artist = await store.getArtistById(ac.artistId);
  if (artist) {
    await sendEmail({
      to: artist.email,
      subject: `New bid on your dossier — ${firm.displayName}`,
      html: `<p><b>${firm.displayName}</b> just bid on your case.</p><p>$${(bid.priceCents / 100).toLocaleString('en-US')} · ${bid.timelineWeeks} weeks</p><p><a href="${baseUrl()}/portal/bids/${bid.id}">Open in your portal →</a></p>`,
    });
  }
  return { bidId: bid.id };
}

export async function acceptBid(bidId: string) {
  const bid = await store.getBid(bidId);
  if (!bid) throw new Error('bid not found');
  const c0 = await store.getCase(bid.caseId);
  const firm = await store.getFirm(bid.firmId);
  const artist = c0 ? await store.getArtistById(c0.artistId) : undefined;
  if (!c0 || !firm || !artist) throw new Error('related rows missing');
  await store.updateBid(bid.id, { status: 'accepted', decidedAt: new Date().toISOString() });
  const siblings = await store.listBidsForCase(c0.id);
  await Promise.all(
    siblings
      .filter((b) => b.id !== bid.id && b.status === 'pending')
      .map((b) => store.updateBid(b.id, { status: 'declined', decidedAt: new Date().toISOString() })),
  );
  await store.updateCase(c0.id, { status: 'matched' });
  const ho = await store.createHandoff({
    caseId: c0.id,
    firmId: firm.id,
    acceptedBidId: bid.id,
    introSentAt: new Date().toISOString(),
    notes: 'Auto-created on bid acceptance.',
  });
  await Promise.all([
    sendEmail({
      to: artist.email,
      subject: `You matched with ${firm.displayName}`,
      html: `<p>Your O-1B case is now with <b>${firm.displayName}</b>.</p><p>Contact: ${firm.contactName || ''} &lt;${firm.contactEmail}&gt;</p><p>Bid: $${(bid.priceCents / 100).toLocaleString('en-US')} · ${bid.timelineWeeks} weeks</p><p><a href="${baseUrl()}/portal/bids/${bid.id}">View in your portal →</a></p>`,
    }),
    sendEmail({
      to: firm.contactEmail,
      subject: `You won an O-1B case — ${artist.stageName || artist.legalName || 'Artist'}`,
      html: `<p>The artist accepted your bid.</p><p>Stage name: <b>${artist.stageName || artist.legalName}</b><br/>Email: ${artist.email}<br/>Phone: ${artist.phone || '—'}</p><p><a href="${baseUrl()}/cases/${c0.id}">Open in your case console →</a></p>`,
    }),
  ]);
  return { handoffId: ho.id };
}

export async function declineBid(bidId: string) {
  const bid = await store.getBid(bidId);
  if (!bid) throw new Error('not found');
  await store.updateBid(bidId, { status: 'declined', decidedAt: new Date().toISOString() });
  return { ok: true };
}

export const firmApplySchema = z.object({
  firmName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  website: z.string().optional(),
  ailaMember: z.boolean().optional(),
  casesLast12Mo: z.number().int().nonnegative().optional(),
});

export async function firmApply(input: z.infer<typeof firmApplySchema>) {
  await store.createWaitlist({
    firmName: input.firmName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    website: input.website,
    ailaMember: !!input.ailaMember,
    casesLast12Mo: input.casesLast12Mo,
  });
  const slug = input.firmName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 48);
  const firm = await store.createFirm({
    displayName: input.firmName,
    slug: `${slug}-${Math.floor(Math.random() * 9999)}`,
    bio: undefined,
    specialties: [],
    languages: [],
    casesHandled: input.casesLast12Mo || 0,
    status: 'pending',
    ailaMember: !!input.ailaMember,
    contactEmail: input.contactEmail,
    contactName: input.contactName,
  });
  await sendEmail({
    to: input.contactEmail,
    subject: 'Application received — VisaTrack',
    html: `<p>Thanks ${input.contactName}. We received your application for <b>${input.firmName}</b> and will review it within 24 hours.</p>`,
  });
  return { firmId: firm.id };
}

export async function approveFirm(id: string) {
  const firm = await store.getFirm(id);
  if (!firm) throw new Error('not found');
  await store.updateFirm(id, { status: 'approved', approvedAt: new Date().toISOString() });
  const magicLink = await issueMagicLink({
    email: firm.contactEmail,
    role: 'firm',
    heading: `${firm.displayName} is approved on VisaTrack`,
    body: 'You can now bid on cases. Click below to open your firm console.',
  });
  return { magicLink };
}

export async function consumeMagicLink(token: string): Promise<
  | { kind: 'artist'; artistId: string; email: string; redirect: string }
  | { kind: 'firm'; firmId: string; email: string; redirect: string }
  | { error: string }
> {
  const t = await store.findToken(token);
  if (!t) return { error: 'invalid token' };
  if (t.usedAt) return { error: 'token already used' };
  if (Date.parse(t.expiresAt) < Date.now()) return { error: 'token expired' };
  await store.markTokenUsed(token);

  if (t.role === 'artist') {
    const a =
      (await store.getArtistByEmail(t.email)) ||
      (await store.upsertArtistByEmail(t.email, { email: t.email }));
    return { kind: 'artist', artistId: a.id, email: t.email, redirect: '/portal' };
  }
  if (t.role === 'firm') {
    const f = await store.getFirmByEmail(t.email);
    if (!f) return { error: 'firm not found for email' };
    if (f.status !== 'approved') return { error: 'firm not approved yet' };
    return { kind: 'firm', firmId: f.id, email: t.email, redirect: '/marketplace' };
  }
  return { error: 'unsupported role' };
}
