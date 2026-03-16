import { useAppStore } from '../store/useAppStore';

describe('explanation persistence', () => {
  it('saves explanation and preserves history', () => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {}, reactDebugging: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);

    useAppStore.getState().saveExplanation('demo', {
      pattern: 'Two Pointers',
      why: 'Move inward and compare.',
      complexity: 'O(n) time, O(1) space'
    });

    const first = useAppStore.getState().progress.problems.demo.explanation;
    expect(first?.pattern).toBe('Two Pointers');

    useAppStore.getState().saveExplanation('demo', {
      pattern: 'Two Pointers',
      why: 'Second attempt explanation.',
      complexity: 'O(n) time, O(1) space'
    });

    const progress = useAppStore.getState().progress.problems.demo;
    expect(progress.explanationHistory?.length).toBe(1);
    expect(progress.explanationHistory?.[0].why).toBe('Move inward and compare.');
  });
});
