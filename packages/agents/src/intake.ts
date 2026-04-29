import type { AgentDefinition } from './types';

export const intakeAgent: AgentDefinition = {
  name: 'intake',
  description:
    'Reads beneficiary intake form + supporting docs, builds artist profile and proposes a case plan.',
  async run() {
    // TODO: implement LangGraph subgraph
    return { status: 'awaiting_gate', output: {} };
  },
};
