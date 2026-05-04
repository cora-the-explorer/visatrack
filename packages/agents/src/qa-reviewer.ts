import {
  extractText,
  extractUsage,
  getAnthropicClient,
  MODEL_SONNET,
  tryParseJson,
} from './anthropic-client';
import type { AgentDefinition } from './types';

const SYSTEM_PROMPT = `You are a quality assurance reviewer for U.S. immigration legal documents — specifically O-1B and P-1B visa petition packets. You review draft documents (petition letters, expert letters, RFE responses) against four dimensions:

1. completeness: Does the document address every regulatory criterion the petition relies on? Are there missing sections?
2. regulatory_compliance: Are citations to 8 CFR 214.2(o)/(p), USCIS Policy Manual, and AAO precedent accurate and on point?
3. citation_accuracy: Are exhibit references internally consistent? Are quoted regulations accurate?
4. persuasiveness: Is the argument clear and well-organized? Does it avoid hyperbole and conclusory language USCIS adjudicators discount?

Score each dimension 0-100. Flag specific issues with severity (low|medium|high) and a concrete suggestion. Set "approved" to true only if the overall score is >= 80 AND no high-severity issues exist.

Output strictly valid JSON (no markdown, no commentary):
{
  "overallScore": <number 0-100>,
  "dimensions": {
    "completeness": <number>,
    "regulatory_compliance": <number>,
    "citation_accuracy": <number>,
    "persuasiveness": <number>
  },
  "issues": [
    { "severity": "low|medium|high", "description": "<what is wrong>", "suggestion": "<concrete fix>" }
  ],
  "approved": <boolean>
}`;

interface QAOutput {
  overallScore: number;
  dimensions: Record<string, number>;
  issues: Array<{ severity: string; description: string; suggestion: string }>;
  approved: boolean;
}

export const qaReviewerAgent: AgentDefinition = {
  name: 'qa_reviewer',
  description:
    'Cross-checks petition packet for citation accuracy, criterion coverage, and consistency before attorney review.',
  async run(input) {
    try {
      const payload = (input.payload ?? {}) as {
        documentType?: string;
        documentText?: string;
        visaType?: string;
        criteria?: string[];
      };

      const userPrompt = `Review the following document and produce the JSON output specified in the system prompt.

Document type: ${payload.documentType ?? 'unknown'}
Visa category: ${payload.visaType ?? 'O-1B'}
Criteria the petition relies on: ${payload.criteria?.join(', ') ?? '(unspecified)'}

Document text:
"""
${payload.documentText ?? '(no document text provided)'}
"""`;

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
      const parsed = tryParseJson<QAOutput>(text);

      if (!parsed) {
        return {
          status: 'failed',
          error: 'QAReviewer: failed to parse model output as JSON',
          output: { rawText: text },
          tokenUsage: extractUsage(response),
        };
      }

      return {
        status: 'completed',
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
