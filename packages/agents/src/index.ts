import type { AgentName } from '@spinvisa/api-types';
import type { AgentDefinition, AgentInput, AgentResult } from './types';
import { intakeAgent } from './intake';
import { evidenceCuratorAgent } from './evidence-curator';
import { expertLetterDrafterAgent } from './expert-letter-drafter';
import { petitionDrafterAgent } from './petition-drafter';
import { rfeResponderAgent } from './rfe-responder';
import { qaReviewerAgent } from './qa-reviewer';

export * from './types';
export * from './anthropic-client';
export {
  intakeAgent,
  evidenceCuratorAgent,
  expertLetterDrafterAgent,
  petitionDrafterAgent,
  rfeResponderAgent,
  qaReviewerAgent,
};

const REGISTRY: Record<AgentName, AgentDefinition> = {
  intake: intakeAgent,
  evidence_curator: evidenceCuratorAgent,
  expert_letter_drafter: expertLetterDrafterAgent,
  petition_drafter: petitionDrafterAgent,
  rfe_responder: rfeResponderAgent,
  qa_reviewer: qaReviewerAgent,
};

export async function dispatchAgent(name: AgentName, input: AgentInput): Promise<AgentResult> {
  const agent = REGISTRY[name];
  if (!agent) {
    throw new Error(`Unknown agent: ${name}`);
  }
  return agent.run(input);
}
