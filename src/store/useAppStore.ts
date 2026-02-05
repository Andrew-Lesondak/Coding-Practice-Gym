import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProgressState, SettingsState, ProblemProgress } from '../types/progress';
import { getOverlayEnabled, setOverlayEnabled } from '../lib/problemPack';

const initialSettings: SettingsState = {
  languageMode: 'ts',
  hintLevel: 1,
  lockSteps: true,
  overlayEnabled: getOverlayEnabled()
};

const createDefaultProgress = (): ProblemProgress => ({
  attempts: 0,
  passes: 0,
  stepCompletion: {},
  reviewIntervalDays: 2,
  easeFactor: 2.3
});

type AppState = {
  progress: ProgressState;
  settings: SettingsState;
  overlayVersion: number;
  updateProblemProgress: (problemId: string, patch: Partial<ProblemProgress>) => void;
  setStepCompletion: (problemId: string, stepIndex: number, completed: boolean) => void;
  resetProblem: (problemId: string) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  toggleOverlay: (enabled: boolean) => void;
  bumpOverlayVersion: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      progress: { problems: {} },
      settings: initialSettings,
      overlayVersion: 0,
      updateProblemProgress: (problemId, patch) =>
        set((state) => {
          const current = state.progress.problems[problemId] ?? createDefaultProgress();
          return {
            progress: {
              problems: {
                ...state.progress.problems,
                [problemId]: { ...current, ...patch }
              }
            }
          };
        }),
      setStepCompletion: (problemId, stepIndex, completed) =>
        set((state) => {
          const current = state.progress.problems[problemId] ?? createDefaultProgress();
          return {
            progress: {
              problems: {
                ...state.progress.problems,
                [problemId]: {
                  ...current,
                  stepCompletion: {
                    ...current.stepCompletion,
                    [stepIndex]: completed
                  }
                }
              }
            }
          };
        }),
      resetProblem: (problemId) =>
        set((state) => ({
          progress: {
            problems: {
              ...state.progress.problems,
              [problemId]: createDefaultProgress()
            }
          }
        })),
      updateSettings: (patch) =>
        set((state) => ({
          settings: { ...state.settings, ...patch }
        })),
      toggleOverlay: (enabled) =>
        set((state) => {
          setOverlayEnabled(enabled);
          return { settings: { ...state.settings, overlayEnabled: enabled } };
        }),
      bumpOverlayVersion: () =>
        set((state) => ({
          overlayVersion: state.overlayVersion + 1
        }))
    }),
    {
      name: 'dsa-gym-store',
      version: 1
    }
  )
);

export const getProblemProgress = (state: ProgressState, problemId: string): ProblemProgress => {
  return state.problems[problemId] ?? createDefaultProgress();
};
