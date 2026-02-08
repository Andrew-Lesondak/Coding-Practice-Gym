import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProgressState,
  SettingsState,
  ProblemProgress,
  SystemDesignProgress,
  StepCompletion,
  SystemDesignDrillProgress
} from '../types/progress';
import { QuizProgress } from '../types/quiz';
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
  easeFactor: 2.3,
  explanationHistory: []
});

const createDefaultSystemDesignProgress = (): SystemDesignProgress => ({
  attempts: 0,
  passes: 0,
  stepCompletion: {},
  rubricChecks: {},
  reviewIntervalDays: 2,
  easeFactor: 2.3,
  explanationHistory: []
});

const createDefaultSystemDesignDrillProgress = (): SystemDesignDrillProgress => ({
  attempts: 0,
  stepCompletion: {},
  rubricChecks: {},
  reviewIntervalDays: 2,
  easeFactor: 2.3,
  explanationHistory: []
});

const createDefaultQuizProgress = (): QuizProgress => ({
  attempts: 0,
  correctCount: 0,
  reviewIntervalDays: 2,
  easeFactor: 2.3
});

type AppState = {
  progress: ProgressState;
  settings: SettingsState;
  overlayVersion: number;
  updateProblemProgress: (problemId: string, patch: Partial<ProblemProgress>) => void;
  setStepCompletion: (problemId: string, stepIndex: number, status: StepCompletion[number]) => void;
  resetProblem: (problemId: string) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  toggleOverlay: (enabled: boolean) => void;
  bumpOverlayVersion: () => void;
  saveExplanation: (
    problemId: string,
    explanation: { pattern: string; why: string; complexity: string }
  ) => void;
  updateSystemDesignProgress: (promptId: string, patch: Partial<SystemDesignProgress>) => void;
  setSystemDesignStepStatus: (promptId: string, stepIndex: number, status: StepCompletion[number]) => void;
  setSystemDesignRubricCheck: (promptId: string, itemId: string, checked: boolean) => void;
  saveSystemDesignExplanation: (
    promptId: string,
    explanation: { tradeoff: string; risk: string; scaleChange: string }
  ) => void;
  updateSystemDesignDrillProgress: (drillId: string, patch: Partial<SystemDesignDrillProgress>) => void;
  setSystemDesignDrillStepStatus: (drillId: string, stepIndex: number, status: StepCompletion[number]) => void;
  setSystemDesignDrillRubricCheck: (drillId: string, itemId: string, checked: boolean) => void;
  saveSystemDesignDrillExplanation: (
    drillId: string,
    explanation: { decision: string; risk: string }
  ) => void;
  updateQuizProgress: (questionId: string, patch: Partial<QuizProgress>) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {} },
      settings: initialSettings,
      overlayVersion: 0,
      updateProblemProgress: (problemId, patch) =>
        set((state) => {
          const current = state.progress.problems[problemId] ?? createDefaultProgress();
          return {
            progress: {
              ...state.progress,
              problems: {
                ...state.progress.problems,
                [problemId]: { ...current, ...patch }
              }
            }
          };
        }),
      setStepCompletion: (problemId, stepIndex, status) =>
        set((state) => {
          const current = state.progress.problems[problemId] ?? createDefaultProgress();
          return {
            progress: {
              ...state.progress,
              problems: {
                ...state.progress.problems,
                [problemId]: {
                  ...current,
                  stepCompletion: {
                    ...current.stepCompletion,
                    [stepIndex]: status
                  }
                }
              }
            }
          };
        }),
      resetProblem: (problemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
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
        })),
      saveExplanation: (problemId, explanation) =>
        set((state) => {
          const current = state.progress.problems[problemId] ?? createDefaultProgress();
          const updatedAt = new Date().toISOString();
          const existing = current.explanation;
          const history = current.explanationHistory ?? [];
          const nextHistory = existing ? [...history, existing] : history;
          return {
            progress: {
              ...state.progress,
              problems: {
                ...state.progress.problems,
                [problemId]: {
                  ...current,
                  explanation: { ...explanation, updatedAt },
                  explanationHistory: nextHistory
                }
              }
            }
          };
        }),
      updateSystemDesignProgress: (promptId, patch) =>
        set((state) => {
          const current = state.progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
          return {
            progress: {
              ...state.progress,
              systemDesign: {
                ...state.progress.systemDesign,
                [promptId]: { ...current, ...patch }
              }
            }
          };
        }),
      setSystemDesignStepStatus: (promptId, stepIndex, status) =>
        set((state) => {
          const current = state.progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
          return {
            progress: {
              ...state.progress,
              systemDesign: {
                ...state.progress.systemDesign,
                [promptId]: {
                  ...current,
                  stepCompletion: {
                    ...current.stepCompletion,
                    [stepIndex]: status
                  }
                }
              }
            }
          };
        }),
      setSystemDesignRubricCheck: (promptId, itemId, checked) =>
        set((state) => {
          const current = state.progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
          return {
            progress: {
              ...state.progress,
              systemDesign: {
                ...state.progress.systemDesign,
                [promptId]: {
                  ...current,
                  rubricChecks: {
                    ...current.rubricChecks,
                    [itemId]: checked
                  }
                }
              }
            }
          };
        }),
      saveSystemDesignExplanation: (promptId, explanation) =>
        set((state) => {
          const current = state.progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
          const updatedAt = new Date().toISOString();
          const existing = current.explanation;
          const history = current.explanationHistory ?? [];
          const nextHistory = existing ? [...history, existing] : history;
          return {
            progress: {
              ...state.progress,
              systemDesign: {
                ...state.progress.systemDesign,
                [promptId]: {
                  ...current,
                  explanation: { ...explanation, updatedAt },
                  explanationHistory: nextHistory
                }
              }
            }
          };
        }),
      updateSystemDesignDrillProgress: (drillId, patch) =>
        set((state) => {
          const current = state.progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
          return {
            progress: {
              ...state.progress,
              systemDesignDrills: {
                ...state.progress.systemDesignDrills,
                [drillId]: { ...current, ...patch }
              }
            }
          };
        }),
      setSystemDesignDrillStepStatus: (drillId, stepIndex, status) =>
        set((state) => {
          const current = state.progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
          return {
            progress: {
              ...state.progress,
              systemDesignDrills: {
                ...state.progress.systemDesignDrills,
                [drillId]: {
                  ...current,
                  stepCompletion: {
                    ...current.stepCompletion,
                    [stepIndex]: status
                  }
                }
              }
            }
          };
        }),
      setSystemDesignDrillRubricCheck: (drillId, itemId, checked) =>
        set((state) => {
          const current = state.progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
          return {
            progress: {
              ...state.progress,
              systemDesignDrills: {
                ...state.progress.systemDesignDrills,
                [drillId]: {
                  ...current,
                  rubricChecks: {
                    ...current.rubricChecks,
                    [itemId]: checked
                  }
                }
              }
            }
          };
        }),
      saveSystemDesignDrillExplanation: (drillId, explanation) =>
        set((state) => {
          const current = state.progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
          const updatedAt = new Date().toISOString();
          const existing = current.explanation;
          const history = current.explanationHistory ?? [];
          const nextHistory = existing ? [...history, existing] : history;
          return {
            progress: {
              ...state.progress,
              systemDesignDrills: {
                ...state.progress.systemDesignDrills,
                [drillId]: {
                  ...current,
                  explanation: { ...explanation, updatedAt },
                  explanationHistory: nextHistory
                }
              }
            }
          };
        }),
      updateQuizProgress: (questionId, patch) =>
        set((state) => {
          const current = state.progress.quizzes[questionId] ?? createDefaultQuizProgress();
          return {
            progress: {
              ...state.progress,
              quizzes: {
                ...state.progress.quizzes,
                [questionId]: { ...current, ...patch }
              }
            }
          };
        })
    }),
    {
      name: 'dsa-gym-store',
      version: 6,
      migrate: (state, version) => {
        if (version === 1) {
          const next = state as AppState;
          Object.values(next.progress.problems).forEach((progress) => {
            if (!progress.explanationHistory) {
              progress.explanationHistory = [];
            }
          });
          if (!next.progress.systemDesign) {
            next.progress.systemDesign = {};
          }
          if (!next.progress.systemDesignDrills) {
            next.progress.systemDesignDrills = {};
          }
          if (!next.progress.quizzes) {
            next.progress.quizzes = {};
          }
          if (typeof next.settings.overlayEnabled !== 'boolean') {
            next.settings.overlayEnabled = getOverlayEnabled();
          }
          return next;
        }
        if (version === 2) {
          const next = state as AppState;
          if (!next.progress.systemDesign) {
            next.progress.systemDesign = {};
          }
          if (!next.progress.quizzes) {
            next.progress.quizzes = {};
          }
          return next;
        }
        if (version === 3) {
          const next = state as AppState;
          if (!next.progress.systemDesign) {
            next.progress.systemDesign = {};
          }
          if (!next.progress.quizzes) {
            next.progress.quizzes = {};
          }
          return next;
        }
        if (version === 4) {
          const next = state as AppState;
          if (!next.progress.systemDesignDrills) {
            next.progress.systemDesignDrills = {};
          }
          if (!next.progress.quizzes) {
            next.progress.quizzes = {};
          }
          return next;
        }
        if (version === 5) {
          const next = state as AppState;
          if (!next.progress.quizzes) {
            next.progress.quizzes = {};
          }
          return next;
        }
        return state as AppState;
      }
    }
  )
);

export const migrateStore = (state: unknown, version: number) => {
  const options = (useAppStore as any).persist?.getOptions?.();
  if (options?.migrate) {
    return options.migrate(state, version);
  }
  return state;
};

export const getProblemProgress = (state: ProgressState, problemId: string): ProblemProgress => {
  return state.problems[problemId] ?? createDefaultProgress();
};

export const getSystemDesignProgress = (state: ProgressState, promptId: string): SystemDesignProgress => {
  return state.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
};

export const getSystemDesignDrillProgress = (
  state: ProgressState,
  drillId: string
): SystemDesignDrillProgress => {
  return state.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
};

export const getQuizProgress = (state: ProgressState, questionId: string): QuizProgress => {
  return state.quizzes[questionId] ?? createDefaultQuizProgress();
};
