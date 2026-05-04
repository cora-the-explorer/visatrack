import {
  extractText,
  extractUsage,
  getAnthropicClient,
  MODEL_OPUS,
} from './anthropic-client';
import type { AgentDefinition } from './types';

const SYSTEM_PROMPT = `You are a senior immigration attorney drafting expert opinion letters for U.S. O-1B and P-1B artist visa petitions. The letters you produce are submitted to USCIS as primary evidence of the beneficiary's extraordinary ability or international recognition.

Your letters must:
- Open with the expert's full name, title, and organization, and clearly state the basis on which the expert is qualified to opine.
- Identify the beneficiary by legal/stage name and the visa category (O-1B or P-1B).
- Address the specific regulatory criteria at 8 CFR 214.2(o)(3) (or 8 CFR 214.2(p) for P-1B), citing concrete evidence rather than conclusory language.
- Explain in plain English why the beneficiary's work meets the standard of "distinction" or "extraordinary ability" as defined by USCIS.
- Avoid boilerplate, exaggeration, or unsupported superlatives. Adjudicators are trained to discount conclusory praise.
- Be written in the first person from the perspective of the named expert, in a professional, restrained tone.
- Run 800-1200 words. Use paragraph breaks for readability.

Output ONLY the letter text. No JSON, no markdown headers, no commentary before or after.`;

export const expertLetterDrafterAgent: AgentDefinition = {
  name: 'expert_letter_drafter',
  description:
    'Drafts expert opinion letters customized to recommender voice using accepted evidence corpus.',
  async run(input) {
    try {
      const payload = (input.payload ?? {}) as {
        expertName?: string;
        expertTitle?: string;
        expertOrg?: string;
        artistName?: string;
        visaType?: string;
        criteria?: string[];
        evidenceSummary?: string;
      };

      const userPrompt = `Draft an expert opinion letter with the following parameters:

Expert (the letter is written FROM this person):
- Name: ${payload.expertName ?? '[EXPERT NAME]'}
- Title: ${payload.expertTitle ?? '[EXPERT TITLE]'}
- Organization: ${payload.expertOrg ?? '[EXPERT ORGANIZATION]'}

Beneficiary:
- Name: ${payload.artistName ?? '[ARTIST NAME]'}
- Visa category: ${payload.visaType ?? 'O-1B'}

Criteria to address: ${payload.criteria?.join(', ') ?? 'all applicable O-1B criteria'}

Evidence summary to weave into the letter:
${payload.evidenceSummary ?? '(no evidence summary provided — write generally about the field)'}

Produce the letter now.`;

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: MODEL_OPUS,
        max_tokens: 4096,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userPrompt }],
      });

      const letterText = extractText(response).trim();
      const wordCount = letterText.split(/\s+/).filter(Boolean).length;

      return {
        status: 'awaiting_gate',
        output: { letterText, wordCount },
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
