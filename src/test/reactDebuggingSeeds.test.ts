import { reactDebuggingProblems, reactDebuggingReferenceEdits } from '../data/reactDebuggingProblems';
import { submitReactDebuggingSolution, runReactDebuggingTests } from '../lib/reactDebuggingRunner';
import { validateReactDebuggingProblem } from '../lib/authorValidation';

describe('react debugging seed pack', () => {
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
