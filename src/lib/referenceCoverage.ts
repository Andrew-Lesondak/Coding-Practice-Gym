import { SystemDesignPrompt } from '../types/systemDesign';

export const normalizeTokens = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

export const isDecisionMentioned = (decision: SystemDesignPrompt['reference']['keyDecisions'][number], text: string) => {
  const tokens = new Set(normalizeTokens(text));
  const decisionTokens = new Set([
    ...normalizeTokens(decision.decision),
    ...normalizeTokens(decision.why),
    ...decision.alternatives.flatMap((alt) => normalizeTokens(alt))
  ]);
  for (const token of decisionTokens) {
    if (tokens.has(token)) return true;
  }
  return false;
};
