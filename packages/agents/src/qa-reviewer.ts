import type { AgentDefinition } from './types';

export const qaReviewerAgent: AgentDefinition = {
  name: 'qa_reviewer',
  description:
    'Cross-checks petition packet for citation accuracy, criterion coverage, and consistency before attorney review.',
  async run() {
    // TODO
    return { status: 'awaiting_gate', output: {} };
  },
};
