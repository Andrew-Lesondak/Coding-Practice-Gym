import { migrateStore } from '../store/useAppStore';

describe('quiz progress migration', () => {
  it('adds quizzes progress map', () => {
    const state = {
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    };
    const migrated = migrateStore(state as any, 5) as any;
    expect(migrated.progress.quizzes).toBeDefined();
  });
});
