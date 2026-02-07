import { Step, TodoRegion } from '../types/problem';
import { StepStatus } from '../types/progress';
import { regionHasCode } from './guidedStub';

const stepRegex = /^##\s*Step\s+(\d+)\s*:\s*(.+)$/gm;
const startRegex = /\[TEMPLATE_START\s+step=(\d+)\]/g;
const endRegex = /\[TEMPLATE_END\s+step=(\d+)\]/g;

export const parseDesignSteps = (markdown: string): Step[] => {
  const steps: Step[] = [];
  stepRegex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = stepRegex.exec(markdown))) {
    steps.push({ index: Number(match[1]), title: match[2].trim(), description: match[2].trim() });
  }
  return steps.sort((a, b) => a.index - b.index);
};

export const parseTemplateRegions = (markdown: string): TodoRegion[] => {
  const regions: TodoRegion[] = [];
  startRegex.lastIndex = 0;
  let startMatch: RegExpExecArray | null;
  while ((startMatch = startRegex.exec(markdown))) {
    const stepIndex = Number(startMatch[1]);
    endRegex.lastIndex = startRegex.lastIndex;
    const endMatch = endRegex.exec(markdown);
    if (!endMatch || Number(endMatch[1]) !== stepIndex) {
      continue;
    }
    const start = startMatch.index + startMatch[0].length;
    const end = endMatch.index;
    regions.push({ stepIndex, start, end, originalContent: markdown.slice(start, end) });
  }
  return regions;
};

const normalizeRegion = (value: string) => value.replace(/\s+/g, ' ').trim();

const regionHasDesignContent = (region: string) => {
  const lines = region.split('\n');
  const meaningful = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^[-*]?\s*TODO:?$/i.test(trimmed)) return false;
    if (/^TODO:?$/i.test(trimmed)) return false;
    return true;
  });
  if (meaningful.length === 0) return false;

  const combined = meaningful
    .map((line) => line.trim().replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, ''))
    .join(' ');
  const hasWordToken = /[A-Za-z0-9]{2,}/.test(combined);
  if (!hasWordToken) {
    return false;
  }
  return regionHasCode(meaningful.join('\n'));
};

export const computeDesignStepStatus = (current: string, original: string): Record<number, StepStatus> => {
  const originalRegions = parseTemplateRegions(original);
  const currentRegions = parseTemplateRegions(current);
  const completion: Record<number, StepStatus> = {};

  originalRegions.forEach((region) => {
    const currentRegion = currentRegions.find((item) => item.stepIndex === region.stepIndex);
    if (!currentRegion) {
      completion[region.stepIndex] = 'not_started';
      return;
    }
    const originalNorm = normalizeRegion(region.originalContent);
    const currentNorm = normalizeRegion(currentRegion.originalContent);
    if (originalNorm == currentNorm) {
      completion[region.stepIndex] = 'not_started';
      return;
    }
    const currentHasCode = regionHasDesignContent(currentRegion.originalContent);
    completion[region.stepIndex] = currentHasCode ? 'completed' : 'in_progress';
  });

  return completion;
};

export const getStepIndexPosition = (markdown: string, stepIndex: number) => {
  const match = new RegExp(`^##\\s*Step\\s+${stepIndex}\\s*:`, 'm').exec(markdown);
  return match?.index ?? 0;
};

export const insertIntoTemplateRegion = (markdown: string, stepIndex: number, text: string) => {
  const startRegex = new RegExp(`\\[TEMPLATE_START\\s+step=${stepIndex}\\]`);
  const endRegex = new RegExp(`\\[TEMPLATE_END\\s+step=${stepIndex}\\]`);
  const startMatch = startRegex.exec(markdown);
  const endMatch = endRegex.exec(markdown);
  if (!startMatch || !endMatch) return markdown;
  const insertPos = endMatch.index;
  const prefix = markdown.slice(0, insertPos).trimEnd();
  const suffix = markdown.slice(insertPos);
  const insertion = `\n- ${text}\n`;
  return `${prefix}${insertion}${suffix}`;
};
