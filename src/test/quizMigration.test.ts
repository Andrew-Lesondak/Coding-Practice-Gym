import { migrateFromLocalStorage } from '../storage/migrations/v1_from_localStorage';
import { getProblemProgress } from '../storage/stores/dsaProgressStore';
import { getSettings } from '../storage/stores/settingsStore';

describe('indexeddb migration', () => {
  it('migrates legacy progress and settings', async () => {
    localStorage.setItem(
      'coding-practice-gym-store',
      JSON.stringify({
        state: {
          progress: {
            problems: {
              demo: { attempts: 2, passes: 1, stepCompletion: {}, reviewIntervalDays: 2, easeFactor: 2.3 }
            },
            systemDesign: {},
            systemDesignDrills: {},
            quizzes: {},
            reactCoding: {}
          },
          settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false }
        }
      })
    );
    localStorage.setItem('coding-practice-gym-overlay-enabled', 'true');

    await migrateFromLocalStorage();
    const progress = await getProblemProgress('demo');
    const settings = await getSettings();
    expect(progress?.passes).toBe(1);
    expect(settings?.overlayEnabled).toBe(true);
  });
});
