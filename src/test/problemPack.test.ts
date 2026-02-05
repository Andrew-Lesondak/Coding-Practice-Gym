import { mergePacks } from '../lib/problemPack';
import { Problem } from '../types/problem';

describe('mergePacks', () => {
  const base: Problem = {
    id: 'a',
    title: 'Base',
    difficulty: 'Easy',
    patterns: [],
    statementMarkdown: '',
    planMarkdown: '',
    examples: [],
    constraints: [],
    functionName: 'a',
    referenceSolution: '',
    guidedStub: '',
    tests: { visible: [], hidden: [] },
    metadata: { timeComplexity: '', spaceComplexity: '', commonPitfalls: [], recallQuestions: [] }
  };

  const overlay: Problem = { ...base, title: 'Overlay', id: 'a' };

  it('overlays by id', () => {
    const merged = mergePacks([base], [overlay]);
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe('Overlay');
  });

  it('adds new problems', () => {
    const extra: Problem = { ...base, id: 'b', title: 'Extra' };
    const merged = mergePacks([base], [extra]);
    expect(merged).toHaveLength(2);
  });
});
