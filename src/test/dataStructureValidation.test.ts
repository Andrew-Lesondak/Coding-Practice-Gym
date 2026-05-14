import { validateDataStructureProblem } from '../lib/authorValidation';
import { formatExpectedComplexity } from '../lib/dataStructureRunner';
import { DataStructureProblem } from '../types/dataStructures';

const baseProblem: DataStructureProblem = {
  id: 'stack',
  title: 'Stack',
  difficulty: 'easy',
  category: 'linear',
  structures: ['Stack'],
  operations: ['push', 'pop'],
  promptMarkdown: 'Prompt',
  requirements: ['One'],
  constraints: ['One'],
  guidedStubTs: `export class Stack<T> {\n  // Step 1: Init\n  // TODO(step 1 start)\n  // init\n  // TODO(step 1 end)\n}`,
  referenceSolutionTs: 'export class Stack<T> {}',
  tests: {
    visible: 'export const tests = [];',
    hidden: 'export const tests = [];'
  },
  metadata: {
    expectedComplexities: [{ operation: 'push', time: 'O(1)' }],
    commonPitfalls: ['pitfall'],
    recallQuestions: ['question'],
    invariants: ['invariant']
  }
};

describe('data structure validation', () => {
  it('accepts a valid problem shape', () => {
    const messages = validateDataStructureProblem(baseProblem);
    expect(messages.filter((message) => message.type === 'error')).toEqual([]);
  });

  it('flags invalid guided stubs', () => {
    const messages = validateDataStructureProblem({
      ...baseProblem,
      guidedStubTs: 'export class Stack<T> {}'
    });

    expect(messages.some((message) => message.message.includes('No step headers'))).toBe(true);
  });

  it('formats operation metadata consistently', () => {
    expect(formatExpectedComplexity({ operation: 'insert', time: 'O(log n)', space: 'O(1)' })).toBe(
      'insert: O(log n) / O(1)'
    );
  });
});
