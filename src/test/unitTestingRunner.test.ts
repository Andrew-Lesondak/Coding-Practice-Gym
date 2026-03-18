import { runUnitTestingTests, submitUnitTestingSolution } from '../lib/unitTestingRunner';
import { unitTestingProblems } from '../data/unitTestingProblems';

describe('unit testing runner', () => {
  it('runs the reference tests for a unit problem', async () => {
    const problem = unitTestingProblems.find((item) => item.id === 'unit-testing-sum-positive-numbers')!;
    const result = await runUnitTestingTests({
      problem,
      testCode: problem.referenceTestFile.contents
    });

    expect(result.ok).toBe(true);
    expect(result.results.every((item) => item.passed)).toBe(true);
  });

  it('returns WEAK_TEST_FAILURE when tests miss hidden mutants', async () => {
    const problem = unitTestingProblems.find((item) => item.id === 'unit-testing-sum-positive-numbers')!;
    const weakTests = `import { describe, it, expect } from "vitest";
import { sumPositiveNumbers } from "./sumPositiveNumbers";

describe("sumPositiveNumbers", () => {
  it("returns a number", () => {
    expect(typeof sumPositiveNumbers([1, 2, 3])).toBe("number");
  });
});`;

    const result = await submitUnitTestingSolution({
      problem,
      testCode: weakTests
    });

    expect(result.ok).toBe(false);
    expect(result.errorType).toBe('WEAK_TEST_FAILURE');
    expect(result.weakMutants?.length).toBeGreaterThan(0);
  });
});
