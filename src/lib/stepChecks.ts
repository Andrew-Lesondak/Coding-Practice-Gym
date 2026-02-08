import { StepCheck } from '../types/problem';

export type StepCheckResult = {
  stepIndex: number;
  checks: Array<{ message: string; passed: boolean }>;
};

export const evaluateStepChecks = (code: string, checks: StepCheck[], stepIndex: number): StepCheckResult => {
  const stepChecks = checks.filter((check) => check.stepIndex === stepIndex);
  const results = stepChecks.map((check) => {
    if (check.kind === 'includes') {
      return { message: check.message, passed: code.includes(check.pattern) };
    }
    try {
      const regex = new RegExp(check.pattern, 'm');
      return { message: check.message, passed: regex.test(code) };
    } catch {
      return { message: check.message, passed: false };
    }
  });
  return { stepIndex, checks: results };
};
