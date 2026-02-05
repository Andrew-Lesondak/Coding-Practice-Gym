import { migrateStore } from '../store/useAppStore';

describe('store migration', () => {
  it('adds explanationHistory when missing', () => {
    const legacyState = {
      progress: { problems: { demo: { attempts: 0, passes: 0, stepCompletion: {}, reviewIntervalDays: 2, easeFactor: 2.3 } } },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true },
      overlayVersion: 0
    };

    const migrated = migrateStore(legacyState, 1) as any;
    expect(migrated.progress.problems.demo.explanationHistory).toBeDefined();
    expect(Array.isArray(migrated.progress.problems.demo.explanationHistory)).toBe(true);
    expect(migrated.progress.systemDesign).toBeDefined();
  });
});
