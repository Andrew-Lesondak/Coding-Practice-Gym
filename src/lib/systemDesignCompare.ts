import { parseDesignSteps, parseTemplateRegions } from './systemDesignStub';
import { SystemDesignPrompt } from '../types/systemDesign';

export type DesignSection = {
  stepNumber: number;
  title: string;
  textContent: string;
};

export const normalizeSectionText = (text: string) =>
  text
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n')
    .trim();

export const extractDesignSections = (markdown: string): DesignSection[] => {
  const steps = parseDesignSteps(markdown);
  const regions = parseTemplateRegions(markdown);
  return steps.map((step) => {
    const region = regions.find((item) => item.stepIndex === step.index);
    const text = region ? markdown.slice(region.start, region.end) : '';
    return {
      stepNumber: step.index,
      title: step.title,
      textContent: normalizeSectionText(text)
    };
  });
};

export const buildReferenceText = (reference: SystemDesignPrompt['reference']) => {
  const decisions = reference.keyDecisions
    .map((decision) => `- ${decision.decision}: ${decision.why} (Alternatives: ${decision.alternatives.join(', ')})`)
    .join('\n');
  return `${reference.overviewMarkdown}\n\nKey decisions:\n${decisions}`.trim();
};
