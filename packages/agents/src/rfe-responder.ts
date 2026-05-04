import {
  extractText,
  extractUsage,
  getAnthropicClient,
  MODEL_OPUS,
} from './anthropic-client';
import type { AgentDefinition } from './types';

const SYSTEM_PROMPT = `You are a senior U.S. immigration attorney responding to USCIS Requests for Evidence (RFEs) on O-1B and P-1B artist visa petitions. Your responses are filed before the deadline stated in the RFE and are typically the petitioner's last opportunity to address USCIS's concerns before adjudication.

Your RFE response must:
- Begin by identifying the receipt number, beneficiary, and date of the RFE notice.
- Address each USCIS concern in the order USCIS raised it. Quote or closely paraphrase the concern, then provide the response.
- Cite the relevant regulation (8 CFR 214.2(o) or (p)) and any supporting policy memoranda or precedent decisions (AAO).
- Identify each new exhibit submitted in response and explain its probative value.
- Be respectful but firm; do not concede points the record actually supports.
- Conclude with a clear renewed request for approval.

Output the response letter text, followed on a new line by:
---METADATA---
{"addressedConcerns": ["short label of concern 1", "short label of concern 2", ...]}

Do not wrap the JSON in markdown.`;

interface RFEOutput {
  responseText: string;
  addressedConcerns: string[];
}

export const rfeResponderAgent: AgentDefinition = {
  name: 'rfe_responder',
  description:
    'Parses RFE notice, identifies gaps, drafts response and curates supplemental evidence.',
  async run(input) {
    try {
      const payload = (input.payload ?? {}) as {
        rfeText?: string;
        artistName?: string;
        visaType?: string;
        additionalEvidence?: Array<{ category: string; title: string; description?: string }>;
      };

      const additionalEvidenceList = (payload.additionalEvidence ?? [])
        .map((e, i) => `New Exhibit ${i + 1} [${e.category}]: ${e.title}${e.description ? ` — ${e.description}` : ''}`)
        .join('\n');

      const userPrompt = `Draft an RFE response with the following inputs:

Beneficiary: ${payload.artistName ?? '[ARTIST NAME]'}
Visa category: ${payload.visaType ?? 'O-1B'}

USCIS RFE notice text:
${payload.rfeText ?? '(no RFE text provided)'}

Additional evidence available to submit in response:
${additionalEvidenceList || '(no additional evidence — argue from existing record)'}

Produce the response letter and metadata block as specified.`;

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

      let responseText = fullText.trim();
      let addressedConcerns: string[] = [];

      if (splitIdx !== -1) {
        responseText = fullText.slice(0, splitIdx).trim();
        const metaRaw = fullText.slice(splitIdx + '---METADATA---'.length).trim();
        try {
          const meta = JSON.parse(metaRaw) as { addressedConcerns?: string[] };
          if (Array.isArray(meta.addressedConcerns)) {
            addressedConcerns = meta.addressedConcerns;
          }
        } catch {
          // ignore
        }
      }

      const output: RFEOutput = { responseText, addressedConcerns };

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
