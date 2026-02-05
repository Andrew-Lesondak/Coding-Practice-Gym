import { mergePacks, mergeSystemDesignPacks } from '../lib/problemPack';
import { Problem } from '../types/problem';
import { SystemDesignPrompt } from '../types/systemDesign';

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

describe('mergeSystemDesignPacks', () => {
  const basePrompt: SystemDesignPrompt = {
    id: 'sd1',
    title: 'Base',
    difficulty: 'easy',
    domain: 'web',
    tags: [],
    promptMarkdown: '',
    requirements: { functional: [], nonFunctional: [] },
    scale: { traffic: '', storage: '', retention: '' },
    constraints: [],
    guidedDesignStubMarkdown: '',
    rubric: { categories: [] },
    reference: { overviewMarkdown: '', keyDecisions: [] },
    recallQuestions: [],
    commonPitfalls: []
  };

  it('overlays by id', () => {
    const overlay = { ...basePrompt, title: 'Overlay' };
    const merged = mergeSystemDesignPacks([basePrompt], [overlay]);
    expect(merged[0].title).toBe('Overlay');
  });
});
