import ts from 'typescript';
import { parseSteps, parseTodoRegions } from './guidedStub';
import { Problem } from '../types/problem';
import { runInWorker } from './runnerClient';
import { parseDesignSteps, parseTemplateRegions } from './systemDesignStub';
import { SystemDesignPrompt } from '../types/systemDesign';
import { SystemDesignDrill } from '../types/systemDesignDrill';
import { systemDesignPrompts } from '../data/systemDesignPrompts';
import { QuizQuestion } from '../types/quiz';

export type ValidationMessage = {
  type: 'error' | 'warning';
  message: string;
};

const getTodoMarkerIssues = (stub: string) => {
  const issues: ValidationMessage[] = [];
  const startRegex = /\/\/\s*TODO\(step\s+(\d+(?:\.\d+)?)\s+start\)/g;
  const endRegex = /\/\/\s*TODO\(step\s+(\d+(?:\.\d+)?)\s+end\)/g;
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

  const topLevelSteps = steps.filter((step) => Number.isInteger(step.index));
  const expected = topLevelSteps
    .map((step, index) => step.index === index + 1)
    .every(Boolean);
  if (!expected) {
    messages.push({ type: 'error', message: 'Top-level step numbers must be sequential starting at 1.' });
  }
  steps.forEach((step) => {
    if (Number.isInteger(step.index)) {
      return;
    }
    const parentIndex = Math.floor(step.index);
    if (!topLevelSteps.some((item) => item.index === parentIndex)) {
      messages.push({
        type: 'error',
        message: `Nested step ${step.index} is missing its parent Step ${parentIndex}.`
      });
    }
  });

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

export const validateDrill = (drill: SystemDesignDrill): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  if (drill.stepsIncluded.length === 0) {
    messages.push({ type: 'error', message: 'Drill must include at least one step.' });
  }
  const steps = parseDesignSteps(drill.starterTemplateMarkdown);
  const stepIds = new Set(steps.map((step) => step.index));
  drill.stepsIncluded.forEach((step) => {
    if (!stepIds.has(step)) {
      messages.push({ type: 'error', message: `Starter template missing step ${step}.` });
    }
  });
  stepIds.forEach((step) => {
    if (!drill.stepsIncluded.includes(step)) {
      messages.push({ type: 'error', message: `Starter template includes step ${step} not in stepsIncluded.` });
    }
  });
  if (drill.rubricSubset.categoryIds.length === 0 || drill.rubricSubset.itemIds.length === 0) {
    messages.push({ type: 'error', message: 'Drill rubric subset must include categories and itemIds.' });
  }
  if (drill.relatedPromptId) {
    const prompt = systemDesignPrompts.find((item) => item.id === drill.relatedPromptId);
    if (!prompt) {
      messages.push({ type: 'warning', message: 'Related prompt ID not found in built-in pack.' });
    } else {
      const categoryIds = new Set(prompt.rubric.categories.map((category) => category.id));
      const itemIds = new Set(
        prompt.rubric.categories.flatMap((category) => category.items.map((item) => item.id))
      );
      drill.rubricSubset.categoryIds.forEach((id) => {
        if (!categoryIds.has(id)) {
          messages.push({ type: 'error', message: `Rubric category id ${id} not found in related prompt.` });
        }
      });
      drill.rubricSubset.itemIds.forEach((id) => {
        if (!itemIds.has(id)) {
          messages.push({ type: 'error', message: `Rubric item id ${id} not found in related prompt.` });
        }
      });
    }
  }
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

export const validateQuizQuestion = (question: QuizQuestion): ValidationMessage[] => {
  const messages: ValidationMessage[] = [];
  if (!question.id) messages.push({ type: 'error', message: 'Quiz question id is required.' });
  if (!question.promptMarkdown) messages.push({ type: 'error', message: 'Prompt is required.' });
  if (!question.explanationMarkdown) messages.push({ type: 'error', message: 'Explanation is required.' });
  if (!question.subtopic) messages.push({ type: 'error', message: 'Subtopic is required.' });
  if (question.type !== 'true_false') {
    if (!question.choices || question.choices.length < 2) {
      messages.push({ type: 'error', message: 'Choices must include at least 2 options.' });
    }
  }
  if (question.type === 'true_false') {
    if (typeof question.correct.true_false !== 'boolean') {
      messages.push({ type: 'error', message: 'True/false answer must be set.' });
    }
  }
  if (question.type === 'single_choice') {
    const ids = new Set((question.choices ?? []).map((choice) => choice.id));
    if (!question.correct.single_choice || !ids.has(question.correct.single_choice)) {
      messages.push({ type: 'error', message: 'Single choice correct id must match a choice.' });
    }
  }
  if (question.type === 'multiple_choice') {
    const ids = new Set((question.choices ?? []).map((choice) => choice.id));
    const selected = question.correct.multiple_choice ?? [];
    if (selected.length < 2) {
      messages.push({ type: 'warning', message: 'Multiple choice should include at least two correct answers.' });
    }
    if (selected.length === 0 || selected.some((id) => !ids.has(id))) {
      messages.push({ type: 'error', message: 'Multiple choice correct ids must match choices.' });
    }
  }
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
