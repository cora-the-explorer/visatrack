import type { AgentDefinition } from './types';

export const rfeResponderAgent: AgentDefinition = {
  name: 'rfe_responder',
  description: 'Parses RFE notice, identifies gaps, drafts response and curates supplemental evidence.',
  async run() {
    // TODO
    return { status: 'awaiting_gate', output: {} };
  },
};
