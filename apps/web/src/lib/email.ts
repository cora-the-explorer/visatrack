// Stub email helper. If RESEND_API_KEY is set, sends via Resend.
// Otherwise console.logs and appends to logs/emails.jsonl so the demo flow stays observable.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_PATH = path.join(LOG_DIR, 'emails.jsonl');

export type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export type SendEmailResult = {
  ok: boolean;
  via: 'resend' | 'log';
  id?: string;
  error?: string;
};

const FROM_DEFAULT =
  process.env.EMAIL_FROM || 'VisaTrack <hello@visatrack.test>';

export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const payload = {
    ts: new Date().toISOString(),
    from: args.from || FROM_DEFAULT,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  };

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; error?: unknown };
      if (!res.ok) {
        console.warn('[email] Resend failed; falling back to log', json);
      } else {
        return { ok: true, via: 'resend', id: json.id };
      }
    } catch (err) {
      console.warn('[email] Resend error; falling back to log', err);
    }
  }

  // Log fallback
  console.log(`[email] → ${args.to} :: ${args.subject}`);
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(LOG_PATH, JSON.stringify(payload) + '\n', 'utf8');
  } catch (err) {
    console.warn('[email] could not write log', err);
  }
  return { ok: true, via: 'log' };
}

export function magicLinkEmail(opts: {
  url: string;
  heading?: string;
  cta?: string;
  body?: string;
}): { subject: string; html: string; text: string } {
  const heading = opts.heading || 'Sign in to VisaTrack';
  const cta = opts.cta || 'Open VisaTrack';
  const body =
    opts.body ||
    'Click the link below to sign in. It expires in 30 minutes and can only be used once.';
  const html = `
    <div style="background:#141414;color:#e8e8e8;padding:32px;font-family:Inter,sans-serif">
      <h1 style="font-family:'Fraunces',serif;color:#39ff8a;font-weight:500;margin:0 0 16px">${heading}</h1>
      <p style="margin:0 0 24px">${body}</p>
      <a href="${opts.url}" style="display:inline-block;background:#39ff8a;color:#141414;padding:14px 22px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none">${cta} →</a>
      <p style="font-size:12px;color:#8a8a8a;margin-top:32px">If the button doesn't work, paste this into your browser:<br/>${opts.url}</p>
    </div>
  `;
  const text = `${heading}\n\n${body}\n\n${cta}: ${opts.url}\n`;
  return { subject: heading, html, text };
}
