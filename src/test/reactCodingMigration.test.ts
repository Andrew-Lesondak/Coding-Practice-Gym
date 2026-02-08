import { migrateStore } from '../store/useAppStore';

describe('react coding migration', () => {
  it('adds reactCoding progress map when missing', () => {
    const legacy = {
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    };

    const migrated = migrateStore(legacy as any, 6) as any;
    expect(migrated.progress.reactCoding).toBeDefined();
  });
});
