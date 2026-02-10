import { extractLegacyState } from '../storage/migrations/v1_from_localStorage';

describe('legacy extraction', () => {
  it('pulls progress/settings from localStorage safely', () => {
    localStorage.setItem(
      'coding-practice-gym-store',
      JSON.stringify({
        state: {
          progress: {
            problems: {
              demo: { attempts: 1, passes: 0, stepCompletion: {}, reviewIntervalDays: 2, easeFactor: 2.3 }
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

    const legacy = extractLegacyState();
    expect(legacy.progress?.problems.demo).toBeDefined();
    expect(legacy.settings?.overlayEnabled).toBe(true);
  });
});
