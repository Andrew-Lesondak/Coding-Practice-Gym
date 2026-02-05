import ts from 'typescript';
import { parseSteps, parseTodoRegions } from './guidedStub';
import { Problem } from '../types/problem';
import { runInWorker } from './runnerClient';
import { parseDesignSteps, parseTemplateRegions } from './systemDesignStub';
import { SystemDesignPrompt } from '../types/systemDesign';

export type ValidationMessage = {
  type: 'error' | 'warning';
  message: string;
};

const getTodoMarkerIssues = (stub: string) => {
  const issues: ValidationMessage[] = [];
  const startRegex = /\/\/\s*TODO\(step\s+(\d+)\s+start\)/g;
  const endRegex = /\/\/\s*TODO\(step\s+(\d+)\s+end\)/g;
  const startCounts = new Map<number, number>();
  const endCounts = new Map<number, number>();
  let match: RegExpExecArray | null;

  while ((match = startRegex.exec(stub))) {
    const step = Number(match[1]);
    startCounts.set(step, (startCounts.get(step) ?? 0) + 1);
  }
  while ((match = endRegex.exec(stub))) {
    const step = Number(match[1]);
    endCounts.set(step, (endCounts.get(step) ?? 0) + 1);
  }

  const steps = new Set([...startCounts.keys(), ...endCounts.keys()]);
  steps.forEach((step) => {
    const starts = startCounts.get(step) ?? 0;
    const ends = endCounts.get(step) ?? 0;
    if (starts !== 1 || ends !== 1) {
      issues.push({
        type: 'error',
        message: `Step ${step} must have exactly one TODO start and one TODO end marker.`
      });
    }
  });

  return issues;
};

export const validateStepMarkers = (stub: string): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const steps = parseSteps(stub);
  if (steps.length === 0) {
    messages.push({ type: 'error', message: 'No step headers found.' });
    return messages;
  }

  const expected = steps.map((step, index) => step.index === index + 1).every(Boolean);
  if (!expected) {
    messages.push({ type: 'error', message: 'Step numbers must be sequential starting at 1.' });
  }

  const regions = parseTodoRegions(stub);
  const regionSteps = new Set(regions.map((region) => region.stepIndex));
  steps.forEach((step) => {
    if (!regionSteps.has(step.index)) {
      messages.push({ type: 'error', message: `Step ${step.index} is missing a TODO region.` });
    }
  });

  messages.push(...getTodoMarkerIssues(stub));

  return messages;
};

export const validateDesignStepMarkers = (markdown: string): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const steps = parseDesignSteps(markdown);
  if (steps.length === 0) {
    messages.push({ type: 'error', message: 'No design step headers found.' });
    return messages;
  }
  const sequential = steps.map((step, index) => step.index === index + 1).every(Boolean);
  if (!sequential) {
    messages.push({ type: 'error', message: 'Design step numbers must be sequential starting at 1.' });
  }
  const regions = parseTemplateRegions(markdown);
  const regionSteps = new Set(regions.map((region) => region.stepIndex));
  steps.forEach((step) => {
    if (!regionSteps.has(step.index)) {
      messages.push({ type: 'error', message: `Step ${step.index} is missing a TEMPLATE_START/END region.` });
    }
  });
  return messages;
};

export const validateRubric = (rubric: SystemDesignPrompt['rubric']): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  if (!rubric || rubric.categories.length === 0) {
    messages.push({ type: 'error', message: 'Rubric must have at least one category.' });
    return messages;
  }
  rubric.categories.forEach((category) => {
    if (category.weight <= 0) {
      messages.push({ type: 'error', message: `Category ${category.title} must have weight > 0.` });
    }
    if (category.items.length === 0) {
      messages.push({ type: 'error', message: `Category ${category.title} must have items.` });
    }
    category.items.forEach((item) => {
      if (item.weight <= 0) {
        messages.push({ type: 'error', message: `Rubric item ${item.text} must have weight > 0.` });
      }
    });
  });
  return messages;
};

export const validateTests = (tests: { name: string; input: string; expected: string }[]) => {
  const messages: ValidationMessage[] = [];
  tests.forEach((test) => {
    try {
      JSON.parse(test.input);
    } catch {
      messages.push({ type: 'error', message: `Test "${test.name}" has invalid JSON input.` });
    }
    try {
      JSON.parse(test.expected);
    } catch {
      messages.push({ type: 'error', message: `Test "${test.name}" has invalid JSON expected output.` });
    }
  });
  return messages;
};

export const validateGuidedStubCompile = (stub: string): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  const result = ts.transpileModule(stub, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
    reportDiagnostics: true
  });

  const errors = result.diagnostics?.filter((diag) => diag.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length > 0) {
    messages.push({
      type: 'warning',
      message: 'Guided stub does not compile cleanly. This is allowed for placeholders, but review before saving.'
    });
  }
  return messages;
};

export const validateReferenceSolution = async (problem: Problem): Promise<ValidationMessage[]> => {
  const messages: ValidationMessage[] = [];
  const tests = [...problem.tests.visible, ...problem.tests.hidden];
  const result = await runInWorker({
    code: problem.referenceSolution,
    functionName: problem.functionName,
    tests,
    language: 'ts',
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat
  });

  if (!result.ok) {
    const failing = result.results.filter((item) => !item.passed);
    if (failing.length > 0) {
      messages.push({ type: 'error', message: `Reference solution failed ${failing.length} test(s).` });
    } else {
      messages.push({ type: 'error', message: result.error ?? 'Reference solution failed.' });
    }
  }

  return messages;
};
