import { unitTestingProblems } from '../data/unitTestingProblems';
import { validateUnitTestingProblem, validateUnitTestingReference } from '../lib/authorValidation';

describe('unit testing seed pack', () => {
  it('includes the required breadth and difficulty coverage', () => {
    const unitCount = unitTestingProblems.filter((problem) => problem.category === 'unit').length;
    const reactCount = unitTestingProblems.filter((problem) => problem.category === 'react-component').length;
    const easyCount = unitTestingProblems.filter((problem) => problem.difficulty === 'easy').length;
    const mediumCount = unitTestingProblems.filter((problem) => problem.difficulty === 'medium').length;
    const hardCount = unitTestingProblems.filter((problem) => problem.difficulty === 'hard').length;

    expect(unitTestingProblems.length).toBeGreaterThanOrEqual(15);
    expect(unitCount).toBeGreaterThanOrEqual(8);
    expect(reactCount).toBeGreaterThanOrEqual(7);
    expect(easyCount).toBeGreaterThanOrEqual(5);
    expect(mediumCount).toBeGreaterThanOrEqual(7);
    expect(hardCount).toBeGreaterThanOrEqual(3);
  });

  it('validates every problem shape and reference tests', async () => {
    for (const problem of unitTestingProblems) {
      const validation = validateUnitTestingProblem(problem);
      expect(validation.filter((item) => item.type === 'error')).toEqual([]);
      const referenceMessages = await validateUnitTestingReference(problem);
      if (referenceMessages.some((item) => item.type === 'error')) {
        throw new Error(`${problem.id}: ${referenceMessages.map((item) => item.message).join(' | ')}`);
      }
    }
  });
});
