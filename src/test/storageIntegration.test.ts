import { initializeStorage, loadAllState } from '../storage';
import { setProblemProgress } from '../storage/stores/dsaProgressStore';
import { setSettings } from '../storage/stores/settingsStore';
import { useAppStore } from '../store/useAppStore';
import { resetDatabaseHard } from '../storage/db';

describe('storage integration', () => {
  beforeEach(async () => {
    await resetDatabaseHard();
  });

  it('loads data from IndexedDB on startup', async () => {
    await setProblemProgress('demo', {
      attempts: 1,
      passes: 1,
      stepCompletion: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3,
      explanationHistory: []
    });
    await setSettings({ languageMode: 'js', hintLevel: 2, lockSteps: false, overlayEnabled: false });

    await initializeStorage();
    const state = await loadAllState();
    useAppStore.getState().hydrateFromStorage({
      progress: state.progress,
      settings: state.settings,
      overlayPack: state.overlayPack,
      drillAttempts: state.drillAttempts,
      mockSessions: state.mockSessions,
      quizSessions: state.quizSessions,
      adaptivePlans: state.adaptivePlans,
      adaptiveRuns: state.adaptiveRuns
    });

    expect(useAppStore.getState().progress.problems.demo.passes).toBe(1);
    expect(useAppStore.getState().settings.languageMode).toBe('js');
  });

  it('migrates legacy localStorage data on initialization', async () => {
    localStorage.setItem(
      'dsa-gym-store',
      JSON.stringify({
        state: {
          progress: {
            problems: {
              legacy: { attempts: 1, passes: 0, stepCompletion: {}, reviewIntervalDays: 2, easeFactor: 2.3 }
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

    await initializeStorage();
    const state = await loadAllState();
    expect(state.progress.problems.legacy).toBeDefined();
  });

  it('persists data across reloads', async () => {
    await setProblemProgress('persisted', {
      attempts: 3,
      passes: 2,
      stepCompletion: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3,
      explanationHistory: []
    });

    const first = await loadAllState();
    const second = await loadAllState();
    expect(first.progress.problems.persisted.passes).toBe(2);
    expect(second.progress.problems.persisted.passes).toBe(2);
  });
});
