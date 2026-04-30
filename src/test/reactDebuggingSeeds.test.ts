import { reactDebuggingProblems, reactDebuggingReferenceEdits } from '../data/reactDebuggingProblems';
import { submitReactDebuggingSolution, runReactDebuggingTests } from '../lib/reactDebuggingRunner';
import { validateReactDebuggingProblem } from '../lib/authorValidation';

const isLoopDetectedError = (value: unknown) => {
  const message =
    value instanceof Error
      ? value.message
      : typeof value === 'string'
        ? value
        : '';
  return message.includes('Loop detected');
};

describe('react debugging seed pack', () => {
  const onWindowError = (event: ErrorEvent) => {
    if (isLoopDetectedError(event.error ?? event.message)) {
      event.preventDefault();
    }
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (isLoopDetectedError(event.reason)) {
      event.preventDefault();
    }
  };

  beforeAll(() => {
    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
  });

  afterAll(() => {
    window.removeEventListener('error', onWindowError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  });

  it('contains exactly the requested 10 built-in challenges', () => {
    expect(reactDebuggingProblems).toHaveLength(10);
  });

  it.each(reactDebuggingProblems)('validates and repairs $id', async (problem) => {
    const validation = validateReactDebuggingProblem(problem);
    expect(validation.filter((message) => message.type === 'error')).toEqual([]);

    const visibleCount = (problem.tests.visible.match(/name:\s*['"`]/g) ?? []).length;
    const hiddenCount = (problem.tests.hidden.match(/name:\s*['"`]/g) ?? []).length;
    expect(visibleCount).toBeGreaterThan(2);
    expect(hiddenCount).toBeGreaterThan(1);

    const brokenVisibleResult = await runReactDebuggingTests({
      problem,
      edits: {},
      testCode: problem.tests.visible
    });
    const brokenSubmitResult = await submitReactDebuggingSolution({
      problem,
      edits: {}
    });
    expect(brokenVisibleResult.ok && brokenSubmitResult.ok).toBe(false);

    const fixedResult = await submitReactDebuggingSolution({
      problem,
      edits: reactDebuggingReferenceEdits[problem.id]
    });
    expect(fixedResult.ok).toBe(true);
  });
});
