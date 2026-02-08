import { Step, TodoRegion } from '../types/problem';
import { StepStatus } from '../types/progress';

const stepRegex = /^\s*\/\/\s*Step\s+(\d+(?:\.\d+)?)\s*:\s*(.+)$/gm;
const todoMarkerRegex = /\/\/\s*TODO\(step\s+(\d+(?:\.\d+)?)\s+(start|end)\)/g;

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
  const open: Record<number, number> = {};
  let match: RegExpExecArray | null;
  todoMarkerRegex.lastIndex = 0;
  while ((match = todoMarkerRegex.exec(code))) {
    const stepIndex = Number(match[1]);
    const kind = match[2];
    if (kind === 'start') {
      let start = match.index + match[0].length;
      if (code[start] === '\r' && code[start + 1] === '\n') {
        start += 2;
      } else if (code[start] === '\n') {
        start += 1;
      }
      open[stepIndex] = start;
    } else if (open[stepIndex] !== undefined) {
      const start = open[stepIndex];
      const end = match.index;
      regions.push({
        stepIndex,
        start,
        end,
        originalContent: code.slice(start, end)
      });
      delete open[stepIndex];
    }
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
  if (!/\S/.test(withoutComments)) return false;
  const tokens = withoutComments.replace(/[^A-Za-z0-9_]+/g, ' ').trim();
  return /[A-Za-z0-9_]{2,}/.test(tokens);
};

const regionHasMeaningfulText = (region: string) => {
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
    const currentHasCode = regionHasCode(current.originalContent);
    const currentHasMeaningful = regionHasMeaningfulText(current.originalContent);
    if (currentHasCode) {
      completion[region.stepIndex] = 'completed';
    } else if (currentHasMeaningful) {
      completion[region.stepIndex] = 'in_progress';
    } else {
      completion[region.stepIndex] = 'not_started';
    }
  }

  steps.forEach((step) => {
    if (completion[step.index]) {
      const children = steps.filter(
        (item) => Math.floor(item.index) === step.index && item.index !== step.index
      );
      if (children.length === 0) {
        return;
      }
      const childStatuses = children.map((child) => completion[child.index] ?? 'not_started');
      const allCompleted = childStatuses.every((status) => status === 'completed');
      const anyStarted = childStatuses.some((status) => status !== 'not_started');
      if (completion[step.index] === 'not_started' && anyStarted) {
        completion[step.index] = 'in_progress';
      } else if (completion[step.index] !== 'completed' && allCompleted) {
        completion[step.index] = 'completed';
      }
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
