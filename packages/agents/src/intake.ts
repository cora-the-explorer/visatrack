import {
  extractText,
  extractUsage,
  getAnthropicClient,
  MODEL_SONNET,
  tryParseJson,
} from './anthropic-client';
import type { AgentDefinition } from './types';

const SYSTEM_PROMPT = `You are an immigration intake analyst specializing in O-1B and P-1B artist visa petitions for the U.S. immigration process. You assess artist profiles against the regulatory criteria at 8 CFR 214.2(o) (O-1B) and 8 CFR 214.2(p) (P-1B), and recommend which visa category and which evidentiary criteria are most likely to support a successful petition.

For O-1B (extraordinary ability in the arts), the regulatory criteria are:
- awards: nationally/internationally recognized prizes
- press: published material about the beneficiary
- judging: serving as judge of others' work
- original_contributions: original contributions of major significance
- authorship: authorship of articles in major media
- leading_role: leading/critical role for distinguished organizations
- high_salary: high salary or remuneration
- commercial_success: commercial successes (box office, recordings)
- memberships: membership in associations requiring outstanding achievement

For P-1B (internationally recognized entertainment groups), the standard is sustained international recognition of the group.

Score each O-1B criterion from 0 (no evidence) to 100 (overwhelming evidence) based on the artist profile provided. Be conservative — only assign high scores when supporting facts are clearly present in the profile.

Output strictly valid JSON with this shape (no markdown, no commentary):
{
  "criteriaStrength": { "<criterion>": <number 0-100>, ... },
  "recommendedVisaType": "O-1B" | "P-1B",
  "notes": "<brief analysis explaining recommendation and noting evidence gaps>"
}`;

interface IntakeOutput {
  criteriaStrength: Record<string, number>;
  recommendedVisaType: string;
  notes: string;
}

export const intakeAgent: AgentDefinition = {
  name: 'intake',
  description:
    'Reads beneficiary intake form + supporting docs, builds artist profile and proposes a case plan.',
  async run(input) {
    try {
      const payload = (input.payload ?? {}) as {
        artistName?: string;
        visaType?: string;
        field?: string;
        bio?: string;
      };

      const userPrompt = `Artist profile:
- Name: ${payload.artistName ?? 'Unknown'}
- Field: ${payload.field ?? 'Unknown'}
- Visa type requested: ${payload.visaType ?? 'O-1B'}
- Biography:
${payload.bio ?? '(no biography provided)'}

Analyze this profile and produce the JSON output specified in the system prompt.`;

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: MODEL_SONNET,
        max_tokens: 2048,
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
      const parsed = tryParseJson<IntakeOutput>(text);

      if (!parsed) {
        return {
          status: 'failed',
          error: 'IntakeAgent: failed to parse model output as JSON',
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
