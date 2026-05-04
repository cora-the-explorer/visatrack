import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

interface IntakeHintRequest {
  field: string;
  question: string;
  response: string;
  context: Record<string, string>;
}

interface IntakeHintResult {
  sufficient: boolean;
  hint?: string;
}

const SYSTEM_PROMPT = `You evaluate intake responses for a visa petition platform. Your job is to decide whether a user's answer to an intake question contains enough specific detail to be usable, or whether the user should be prompted to add more.

Rules:
- Career/bio answers must include 2-3 concrete specifics: venue names, award titles, publications, chart positions, festival appearances, tour stops, label names, or similarly named entities. Vague answers like "plays clubs", "has done a lot of shows", "well known in the scene", "big in Europe" are NOT sufficient — they describe categories without naming anything.
- Simple factual fields (name, email, company, phone, instagram handle, country, date) are sufficient if non-empty and roughly well-formed.
- A short answer with one strong specific (e.g. "Won the 2023 IMS Pioneer Award") may be sufficient on its own. Use judgement.
- The hint must be actionable and include a concrete example that fits the user's apparent field. Keep it under 25 words.

Respond with ONLY valid JSON, no preamble, no markdown fencing:
{"sufficient":true}
or
{"sufficient":false,"hint":"Specific actionable feedback with a concrete example."}`;

function tryParseJson(text: string): IntakeHintResult | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced && fenced[1] ? fenced[1].trim() : text.trim();
  try {
    return JSON.parse(candidate) as IntakeHintResult;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as IntakeHintResult;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: IntakeHintRequest;
  try {
    body = (await req.json()) as IntakeHintRequest;
  } catch {
    return Response.json({ sufficient: true });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ sufficient: true });
  }

  try {
    const client = new Anthropic({ apiKey });

    const contextLines = Object.entries(body.context ?? {})
      .filter(([, v]) => v && v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const userMessage = [
      `Field: ${body.field}`,
      `Question asked: ${body.question}`,
      `User's response: ${body.response}`,
      contextLines ? `\nKnown context:\n${contextLines}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = message.content
      .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const parsed = tryParseJson(text);
    if (!parsed) return Response.json({ sufficient: true });

    if (parsed.sufficient) return Response.json({ sufficient: true });
    return Response.json({
      sufficient: false,
      hint: parsed.hint || 'Try adding 2-3 specific examples (venue names, awards, or publications).',
    });
  } catch {
    return Response.json({ sufficient: true });
  }
}
