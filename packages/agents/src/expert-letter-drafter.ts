import type { AgentDefinition } from './types';

export const expertLetterDrafterAgent: AgentDefinition = {
  name: 'expert_letter_drafter',
  description:
    'Drafts expert opinion letters customized to recommender voice using accepted evidence corpus.',
  async run() {
    // TODO
    return { status: 'awaiting_gate', output: {} };
  },
};
