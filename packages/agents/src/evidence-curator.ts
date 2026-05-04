import {
  extractText,
  extractUsage,
  getAnthropicClient,
  MODEL_SONNET,
  tryParseJson,
} from './anthropic-client';
import type { AgentDefinition } from './types';

const SYSTEM_PROMPT = `You are an evidence curator for U.S. artist visa petitions (O-1B and P-1B). For each regulatory criterion, you propose specific, concrete evidence items the legal team should search for or collect to build the strongest possible petition record.

The O-1B criteria at 8 CFR 214.2(o)(3)(iv) are:
- awards: nationally/internationally recognized prizes for excellence
- press: published material in professional or major trade publications about the beneficiary
- judging: participation as judge of the work of others in the same field
- original_contributions: original artistic contributions of major significance
- authorship: authorship of scholarly articles in major publications
- leading_role: leading, starring, or critical role in distinguished productions/organizations
- high_salary: high salary or other substantially high remuneration
- commercial_success: commercial successes evidenced by box-office receipts, sales, ratings
- memberships: membership in associations that require outstanding achievement

For each criterion, propose 3-5 specific evidence items. Each item should describe what to look for, where it might be found, and why it would be probative.

Output strictly valid JSON (no markdown, no commentary):
{
  "proposedEvidence": [
    {
      "category": "<one of: awards|press|judging|original_contributions|authorship|leading_role|high_salary|commercial_success|memberships>",
      "title": "<short descriptive title>",
      "description": "<what to search for and why>",
      "strength": <number 0-100, expected probative weight>,
      "sourceHint": "<where to look — e.g., music industry trade press, awards databases, label records>"
    },
    ...
  ]
}`;

interface EvidenceCuratorOutput {
  proposedEvidence: Array<{
    category: string;
    title: string;
    description: string;
    strength: number;
    sourceHint: string;
  }>;
}

export const evidenceCuratorAgent: AgentDefinition = {
  name: 'evidence_curator',
  description:
    'Searches sources, proposes evidence items mapped to O-1B regulatory criteria, scores strength.',
  async run(input) {
    try {
      const payload = (input.payload ?? {}) as {
        artistName?: string;
        field?: string;
        criteria?: string[];
      };

      const criteriaList = payload.criteria?.length
        ? payload.criteria.join(', ')
        : 'all O-1B criteria';

      const userPrompt = `Build an evidence search plan for the following artist:
- Name: ${payload.artistName ?? 'Unknown'}
- Field: ${payload.field ?? 'Unknown'}
- Criteria to address: ${criteriaList}

Produce 3-5 specific, actionable evidence items per criterion. Output the JSON specified in the system prompt.`;

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: MODEL_SONNET,
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

      const text = extractText(response);
      const parsed = tryParseJson<EvidenceCuratorOutput>(text);

      if (!parsed || !Array.isArray(parsed.proposedEvidence)) {
        return {
          status: 'failed',
          error: 'EvidenceCuratorAgent: failed to parse model output as JSON',
          output: { rawText: text },
          tokenUsage: extractUsage(response),
        };
      }

      return {
        status: 'awaiting_gate',
        output: parsed as unknown as Record<string, unknown>,
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
