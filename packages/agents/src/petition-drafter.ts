import type { AgentDefinition } from './types';

export const petitionDrafterAgent: AgentDefinition = {
  name: 'petition_drafter',
  description: 'Drafts the petition letter weaving accepted evidence into regulatory narrative.',
  async run() {
    // TODO
    return { status: 'awaiting_gate', output: {} };
  },
};
