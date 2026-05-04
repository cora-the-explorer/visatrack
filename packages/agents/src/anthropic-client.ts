import Anthropic from '@anthropic-ai/sdk';

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required');
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const MODEL_OPUS = 'claude-opus-4-7';
export const MODEL_SONNET = 'claude-sonnet-4-6';

export interface AnthropicTextResponse {
  text: string;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    cachedTokens?: number;
  };
}

export function extractText(response: Anthropic.Messages.Message): string {
  return response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

export function extractUsage(response: Anthropic.Messages.Message): AnthropicTextResponse['usage'] {
  return {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cachedTokens: response.usage.cache_read_input_tokens ?? undefined,
  };
}

export function tryParseJson<T = unknown>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced && fenced[1] ? fenced[1].trim() : text.trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
