import { dataStructureProblems } from '../data/dataStructureProblems';
import { runDataStructureTests, submitDataStructureSolution } from '../lib/dataStructureRunner';

describe('data structure runner', () => {
  it('runs visible tests for the reference solution', async () => {
    const problem = dataStructureProblems.find((item) => item.id === 'data-structure-stack');
    expect(problem).toBeDefined();

    const result = await runDataStructureTests({
      problem: problem!,
      code: problem!.referenceSolutionTs
    });

    expect(result.ok).toBe(true);
    expect(result.results.length).toBeGreaterThanOrEqual(5);
  });

  it('fails a broken implementation on submit', async () => {
    const problem = dataStructureProblems.find((item) => item.id === 'data-structure-stack');
    expect(problem).toBeDefined();

    const result = await submitDataStructureSolution({
      problem: problem!,
      code: problem!.referenceSolutionTs.replace('return this.items.pop();', 'return this.items.shift();')
    });

    expect(result.ok).toBe(false);
  });
});
