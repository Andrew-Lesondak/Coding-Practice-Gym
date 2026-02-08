import { Step, TodoRegion } from '../types/problem';
import { StepStatus } from '../types/progress';

const stepRegex = /^\s*\/\/\s*Step\s+(\d+(?:\.\d+)?)\s*:\s*(.+)$/gm;
const todoStartRegex = /\/\/\s*TODO\(step\s+(\d+(?:\.\d+)?)\s+start\)\s*\n/g;
const todoEndRegex = /\/\/\s*TODO\(step\s+(\d+(?:\.\d+)?)\s+end\)/g;

export const parseSteps = (stub: string): Step[] => {
  const steps: Step[] = [];
  let match: RegExpExecArray | null;
  stepRegex.lastIndex = 0;
  while ((match = stepRegex.exec(stub))) {
    steps.push({
      index: Number(match[1]),
      title: match[2].trim(),
      description: match[2].trim()
    });
  }
  return steps.sort((a, b) => a.index - b.index);
};

export const parseTodoRegions = (code: string): TodoRegion[] => {
  const regions: TodoRegion[] = [];
  let startMatch: RegExpExecArray | null;
  todoStartRegex.lastIndex = 0;
  while ((startMatch = todoStartRegex.exec(code))) {
    const stepIndex = Number(startMatch[1]);
    todoEndRegex.lastIndex = todoStartRegex.lastIndex;
    const endMatch = todoEndRegex.exec(code);
    if (!endMatch || Number(endMatch[1]) !== stepIndex) {
      continue;
    }
    const start = startMatch.index + startMatch[0].length;
    const end = endMatch.index;
    regions.push({
      stepIndex,
      start,
      end,
      originalContent: code.slice(start, end)
    });
  }
  return regions;
};

export const normalizeRegion = (value: string) => value.replace(/\s+/g, ' ').trim();

const stripComments = (region: string) => {
  const withoutBlockComments = region.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlockComments.replace(/\/\/.*$/gm, '');
};

export const regionHasCode = (region: string) => {
  const withoutComments = stripComments(region);
  return /\S/.test(withoutComments);
};

export const computeStepCompletion = (
  currentCode: string,
  originalStub: string
): Record<number, StepStatus> => {
  const steps = parseSteps(originalStub);
  const originalRegions = parseTodoRegions(originalStub);
  const currentRegions = parseTodoRegions(currentCode);
  const completion: Record<number, StepStatus> = {};

  for (const region of originalRegions) {
    const current = currentRegions.find((item) => item.stepIndex === region.stepIndex);
    if (!current) {
      completion[region.stepIndex] = 'not_started';
      continue;
    }
    const originalNorm = normalizeRegion(region.originalContent);
    const currentNorm = normalizeRegion(current.originalContent);
    const originalHasCode = regionHasCode(region.originalContent);
    const currentHasCode = regionHasCode(current.originalContent);
    if (currentHasCode) {
      completion[region.stepIndex] = 'completed';
    } else if (originalHasCode && originalNorm !== currentNorm) {
      completion[region.stepIndex] = 'in_progress';
    } else {
      completion[region.stepIndex] = 'not_started';
    }
  }

  steps.forEach((step) => {
    if (completion[step.index]) {
      return;
    }
    const children = steps.filter(
      (item) => Math.floor(item.index) === step.index && item.index !== step.index
    );
    if (children.length === 0) {
      completion[step.index] = 'not_started';
      return;
    }
    const childStatuses = children.map((child) => completion[child.index] ?? 'not_started');
    const allCompleted = childStatuses.every((status) => status === 'completed');
    const anyStarted = childStatuses.some((status) => status !== 'not_started');
    completion[step.index] = allCompleted ? 'completed' : anyStarted ? 'in_progress' : 'not_started';
  });

  return completion;
};

export const getFirstIncompleteStep = (
  completion: Record<number, StepStatus>,
  steps: Step[],
  regionSteps?: Set<number>
) => {
  for (const step of steps) {
    if (regionSteps && !regionSteps.has(step.index)) {
      continue;
    }
    if (completion[step.index] !== 'completed') {
      return step.index;
    }
  }
  return steps[steps.length - 1]?.index ?? 1;
};

export const findLockedRegion = (
  previousCode: string,
  nextCode: string,
  lockedStepIndex: number
): boolean => {
  if (previousCode === nextCode) {
    return false;
  }
  const regions = parseTodoRegions(nextCode);
  const lockedRegions = regions.filter((region) => region.stepIndex > lockedStepIndex);
  if (lockedRegions.length === 0) {
    return false;
  }
  const diffStart = getFirstDiffIndex(previousCode, nextCode);
  if (diffStart === -1) {
    return false;
  }
  return lockedRegions.some((region) => diffStart >= region.start && diffStart <= region.end);
};

const getFirstDiffIndex = (a: string, b: string) => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) {
      return i;
    }
  }
  return a.length === b.length ? -1 : len;
};
