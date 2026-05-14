import { dataStructureProblems } from '../data/dataStructureProblems';
import { validateDataStructureProblem, validateDataStructureReference } from '../lib/authorValidation';

describe('data structure seed pack', () => {
  it('includes all required built-in structures', () => {
    expect(dataStructureProblems.length).toBeGreaterThanOrEqual(16);
    expect(dataStructureProblems.some((problem) => problem.structures.includes('Stack'))).toBe(true);
    expect(dataStructureProblems.some((problem) => problem.structures.includes('Trie'))).toBe(true);
    expect(dataStructureProblems.some((problem) => problem.structures.includes('LRU Cache'))).toBe(true);
    expect(dataStructureProblems.some((problem) => problem.structures.includes('Time-Based Key-Value Store'))).toBe(true);
  });

  it('validates every problem shape and reference solution', async () => {
    for (const problem of dataStructureProblems) {
      const validation = validateDataStructureProblem(problem);
      expect(validation.filter((item) => item.type === 'error')).toEqual([]);
      const referenceMessages = await validateDataStructureReference(problem);
      if (referenceMessages.some((item) => item.type === 'error')) {
        throw new Error(`${problem.id}: ${referenceMessages.map((item) => item.message).join(' | ')}`);
      }
    }
  });
});
