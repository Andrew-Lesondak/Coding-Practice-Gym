import { migrateFromLocalStorage } from '../storage/migrations/v1_from_localStorage';
import { getReactCodingProgressEntry } from '../storage/stores/reactCodingStore';

describe('indexeddb migration idempotency', () => {
  it('can run multiple times without losing data', async () => {
    localStorage.setItem(
      'coding-practice-gym-store',
      JSON.stringify({
        state: {
          progress: {
            problems: {},
            systemDesign: {},
            systemDesignDrills: {},
            quizzes: {},
            reactCoding: {
              demo: { attempts: 1, passes: 1, stepCompletion: {}, reviewIntervalDays: 2, easeFactor: 2.3 }
            }
          },
          settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false }
        }
      })
    );

    await migrateFromLocalStorage();
    await migrateFromLocalStorage();
    const progress = await getReactCodingProgressEntry('demo');
    expect(progress?.passes).toBe(1);
  });
});
