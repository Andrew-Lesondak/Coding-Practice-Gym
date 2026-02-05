import { validateStepMarkers, validateReferenceSolution } from '../lib/authorValidation';
import { Problem } from '../types/problem';
import { vi } from 'vitest';

vi.mock('../lib/runnerClient', () => ({
  runInWorker: vi.fn()
}));

const baseProblem: Problem = {
  id: 'demo',
  title: 'Demo',
  difficulty: 'Easy',
  patterns: ['Demo'],
  statementMarkdown: '',
  planMarkdown: '',
  examples: [],
  constraints: [],
  functionName: 'demo',
  referenceSolution: 'function demo() { return 1; }',
  guidedStub: 'function demo() { return 1; }',
  tests: { visible: [], hidden: [] },
  metadata: { timeComplexity: '', spaceComplexity: '', commonPitfalls: [], recallQuestions: [] }
};

describe('validateStepMarkers', () => {
  it('flags non-sequential steps', () => {
    const stub = `function demo() {\n  // Step 2: Bad\n  // TODO(step 2 start)\n  // placeholder\n  // TODO(step 2 end)\n}`;
    const messages = validateStepMarkers(stub);
    expect(messages.some((m) => m.message.includes('sequential'))).toBe(true);
  });
});

describe('validateReferenceSolution', () => {
  it('returns error when reference fails', async () => {
    const { runInWorker } = await import('../lib/runnerClient');
    (runInWorker as any).mockResolvedValue({ ok: false, results: [] });
    const messages = await validateReferenceSolution(baseProblem);
    expect(messages.some((m) => m.type === 'error')).toBe(true);
  });
});
