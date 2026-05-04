import type { AgentName } from '@visa-track/api-types';

export interface AgentInput {
  tenantId: string;
  caseId: string;
  triggeredByUserId?: string;
  payload?: Record<string, unknown>;
}

export interface AgentResult {
  status: 'completed' | 'awaiting_gate' | 'failed';
  output?: Record<string, unknown>;
  error?: string;
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    cachedTokens?: number;
  };
}

export interface AgentDefinition {
  name: AgentName;
  description: string;
  run: (input: AgentInput) => Promise<AgentResult>;
}
