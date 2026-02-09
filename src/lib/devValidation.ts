import { Problem } from '../types/problem';
import { runInWorker } from './runnerClient';

export type ValidationIssue = {
  problemId: string;
  message: string;
};

export const validateProblemPack = async (problems: Problem[]): Promise<ValidationIssue[]> => {
  const issues: ValidationIssue[] = [];

  for (const problem of problems) {
    const tests = [...problem.tests.visible, ...problem.tests.hidden];
    const result = await runInWorker(
      {
        code: problem.referenceSolution,
        functionName: problem.functionName,
        tests,
        language: 'ts',
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat
      },
      3000
    );

    if (!result.ok) {
      if (result.errorType === 'TIMEOUT') {
        continue;
      }
      const failing = result.results.filter((item) => !item.passed);
      const message = failing.length
        ? `Reference solution failed ${failing.length} tests.`
        : result.error ?? 'Reference solution failed.';
      issues.push({ problemId: problem.id, message });
    }
  }

  return issues;
};
