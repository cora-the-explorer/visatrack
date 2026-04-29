import type { AgentDefinition } from './types';

export const evidenceCuratorAgent: AgentDefinition = {
  name: 'evidence_curator',
  description:
    'Searches sources, proposes evidence items mapped to O-1B regulatory criteria, scores strength.',
  async run() {
    // TODO: implement LangGraph subgraph with Voyage RAG
    return { status: 'awaiting_gate', output: {} };
  },
};
