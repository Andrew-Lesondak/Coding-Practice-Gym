import { problems } from '../data/problems';
import { runInWorker } from './runnerClient';

export type ValidationIssue = {
  problemId: string;
  message: string;
};

export const validateProblemPack = async (): Promise<ValidationIssue[]> => {
  const issues: ValidationIssue[] = [];

  for (const problem of problems) {
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
      const message = failing.length
        ? `Reference solution failed ${failing.length} tests.`
        : result.error ?? 'Reference solution failed.';
      issues.push({ problemId: problem.id, message });
    }
  }

  return issues;
};
