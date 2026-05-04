import {
  extractText,
  extractUsage,
  getAnthropicClient,
  MODEL_OPUS,
} from './anthropic-client';
import type { AgentDefinition } from './types';

const SYSTEM_PROMPT = `You are a senior U.S. immigration attorney drafting petition support letters (Form I-129 supporting brief) for O-1B and P-1B artist visa petitions. The letter you produce is submitted to USCIS as the primary legal argument for why the petition should be approved.

Your petition support letter must:
- Open with a formal salutation to the USCIS officer and identify the petitioner, beneficiary, and visa classification sought.
- Cite the controlling regulations: 8 CFR 214.2(o)(3) for O-1B; 8 CFR 214.2(p)(4) for P-1B.
- For each regulatory criterion the petition relies on, write a dedicated section that:
  1. Quotes or paraphrases the regulatory standard,
  2. Identifies the specific evidence in the record (Exhibit A, B, etc.),
  3. Explains why that evidence satisfies the standard,
  4. Cites supporting precedent (AAO decisions, USCIS Policy Manual) where appropriate.
- Address the consultation requirement and itinerary if relevant.
- Conclude with a clear request for approval.
- Run 2000-3000 words. Use clear section headings.
- Maintain a professional, persuasive but measured tone. Avoid hyperbole.

Output the petition letter text first, followed on a new line by:
---METADATA---
{"criteriaAddressed": ["awards", "press", ...]}

Do not wrap the JSON in markdown.`;

interface PetitionOutput {
  petitionText: string;
  criteriaAddressed: string[];
  wordCount: number;
}

export const petitionDrafterAgent: AgentDefinition = {
  name: 'petition_drafter',
  description: 'Drafts the petition letter weaving accepted evidence into regulatory narrative.',
  async run(input) {
    try {
      const payload = (input.payload ?? {}) as {
        artistName?: string;
        visaType?: string;
        field?: string;
        acceptedEvidence?: Array<{ category: string; title: string; description?: string }>;
        expertLetters?: Array<{ expertName: string; summary?: string }>;
      };

      const evidenceList = (payload.acceptedEvidence ?? [])
        .map(
          (e, i) =>
            `Exhibit ${String.fromCharCode(65 + i)} [${e.category}]: ${e.title}${
              e.description ? ` — ${e.description}` : ''
            }`,
        )
        .join('\n');

      const expertList = (payload.expertLetters ?? [])
        .map(
          (l) =>
            `- ${l.expertName}${l.summary ? `: ${l.summary}` : ''}`,
        )
        .join('\n');

      const userPrompt = `Draft a petition support letter with the following record:

Beneficiary: ${payload.artistName ?? '[ARTIST NAME]'}
Field: ${payload.field ?? '[FIELD]'}
Visa category: ${payload.visaType ?? 'O-1B'}

Accepted evidence:
${evidenceList || '(no evidence provided)'}

Expert letters in the record:
${expertList || '(no expert letters in record)'}

Produce the petition letter and metadata block as specified.`;

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: MODEL_OPUS,
        max_tokens: 8192,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      });

      const fullText = extractText(response);
      const splitIdx = fullText.indexOf('---METADATA---');

      let petitionText = fullText.trim();
      let criteriaAddressed: string[] = [];

      if (splitIdx !== -1) {
        petitionText = fullText.slice(0, splitIdx).trim();
        const metaRaw = fullText.slice(splitIdx + '---METADATA---'.length).trim();
        try {
          const meta = JSON.parse(metaRaw) as { criteriaAddressed?: string[] };
          if (Array.isArray(meta.criteriaAddressed)) {
            criteriaAddressed = meta.criteriaAddressed;
          }
        } catch {
          // ignore — leave criteriaAddressed empty
        }
      }

      const wordCount = petitionText.split(/\s+/).filter(Boolean).length;
      const output: PetitionOutput = { petitionText, criteriaAddressed, wordCount };

      return {
        status: 'awaiting_gate',
        output: output as unknown as Record<string, unknown>,
        tokenUsage: extractUsage(response),
      };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
