import { Step, TodoRegion } from '../types/problem';

const stepRegex = /^\s*\/\/\s*Step\s+(\d+)\s*:\s*(.+)$/gm;
const todoStartRegex = /\/\/\s*TODO\(step\s+(\d+)\s+start\)\s*\n/g;
const todoEndRegex = /\/\/\s*TODO\(step\s+(\d+)\s+end\)/g;

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

export const computeStepCompletion = (
  currentCode: string,
  originalStub: string
): Record<number, boolean> => {
  const originalRegions = parseTodoRegions(originalStub);
  const currentRegions = parseTodoRegions(currentCode);
  const completion: Record<number, boolean> = {};

  for (const region of originalRegions) {
    const current = currentRegions.find((item) => item.stepIndex === region.stepIndex);
    if (!current) {
      completion[region.stepIndex] = false;
      continue;
    }
    const originalNorm = normalizeRegion(region.originalContent);
    const currentNorm = normalizeRegion(current.originalContent);
    completion[region.stepIndex] = originalNorm !== currentNorm;
  }

  return completion;
};

export const getFirstIncompleteStep = (completion: Record<number, boolean>, steps: Step[]) => {
  for (const step of steps) {
    if (!completion[step.index]) {
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
