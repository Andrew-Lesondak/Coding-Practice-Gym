import { create } from 'zustand';
import {
  ProgressState,
  SettingsState,
  ProblemProgress,
  SystemDesignProgress,
  StepCompletion,
  SystemDesignDrillProgress
} from '../types/progress';
import { QuizProgress } from '../types/quiz';
import { ReactCodingProgress } from '../types/reactCoding';
import { ReactDebuggingProgress } from '../types/reactDebugging';
import { UnitTestingProgress } from '../types/unitTesting';
import { OverlayPack } from '../lib/problemPack';
import { DrillAttempt } from '../lib/dsaDrillStorage';
import { SystemDesignMockSession } from '../types/systemDesignMock';
import { QuizSession } from '../types/quiz';
import { AdaptiveSessionPlan, AdaptiveSessionRun } from '../types/adaptive';
import { setProblemProgress } from '../storage/stores/dsaProgressStore';
import { setSystemDesignProgressEntry } from '../storage/stores/systemDesignStore';
import { setSystemDesignDrillProgressEntry } from '../storage/stores/systemDesignDrillsStore';
import { setQuizProgressEntry } from '../storage/stores/quizProgressStore';
import { setReactCodingProgressEntry } from '../storage/stores/reactCodingStore';
import { setReactDebuggingProgressEntry } from '../storage/stores/reactDebuggingStore';
import { setUnitTestingProgressEntry } from '../storage/stores/unitTestingStore';
import { setSettings } from '../storage/stores/settingsStore';
import { clearOverlayPack, setOverlayPack as persistOverlayPack } from '../storage/stores/overlayPackStore';
import { addDrillAttempt } from '../storage/stores/dsaDrillsStore';
import { saveMockSession } from '../storage/stores/mockInterviewStore';
import { saveQuizSession } from '../storage/stores/quizSessionStore';
import { saveAdaptivePlan, saveAdaptiveRun } from '../storage/stores/adaptiveSessionStore';

const initialSettings: SettingsState = {
  languageMode: 'ts',
  hintLevel: 1,
  lockSteps: true,
  overlayEnabled: false
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

const createDefaultReactCodingProgress = (): ReactCodingProgress => ({
  attempts: 0,
  passes: 0,
  stepCompletion: {},
  reviewIntervalDays: 2,
  easeFactor: 2.3,
  explanationHistory: []
});

const createDefaultReactDebuggingProgress = (): ReactDebuggingProgress => ({
  attempts: 0,
  passes: 0,
  reviewIntervalDays: 2,
  easeFactor: 2.3,
  explanationHistory: []
});

const createDefaultUnitTestingProgress = (): UnitTestingProgress => ({
  attempts: 0,
  passes: 0,
  stepCompletion: {},
  reviewIntervalDays: 2,
  easeFactor: 2.3,
  explanationHistory: []
});

export type StorageStatus = 'idle' | 'migrating' | 'ready' | 'unavailable' | 'error';

type HydratedState = {
  progress: ProgressState | null;
  settings: SettingsState | null;
  overlayPack: OverlayPack | null;
  drillAttempts: DrillAttempt[];
  mockSessions: SystemDesignMockSession[];
  quizSessions: QuizSession[];
  adaptivePlans: AdaptiveSessionPlan[];
  adaptiveRuns: AdaptiveSessionRun[];
};

type AppState = {
  progress: ProgressState;
  settings: SettingsState;
  overlayPack: OverlayPack | null;
  overlayVersion: number;
  drillAttempts: DrillAttempt[];
  mockSessions: SystemDesignMockSession[];
  quizSessions: QuizSession[];
  adaptivePlans: AdaptiveSessionPlan[];
  adaptiveRuns: AdaptiveSessionRun[];
  storageStatus: StorageStatus;
  storageError?: string;
  hydrateFromStorage: (payload: HydratedState) => void;
  setStorageStatus: (status: StorageStatus, error?: string) => void;
  updateProblemProgress: (problemId: string, patch: Partial<ProblemProgress>) => void;
  setStepCompletion: (problemId: string, stepIndex: number, status: StepCompletion[number]) => void;
  resetProblem: (problemId: string) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  toggleOverlay: (enabled: boolean) => void;
  setOverlayPack: (pack: OverlayPack | null) => void;
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
  updateReactCodingProgress: (problemId: string, patch: Partial<ReactCodingProgress>) => void;
  setReactCodingStepStatus: (problemId: string, stepIndex: number, status: StepCompletion[number]) => void;
  saveReactCodingExplanation: (
    problemId: string,
    explanation: { concept: string; edgeCase: string; reviewWatch: string }
  ) => void;
  updateReactDebuggingProgress: (problemId: string, patch: Partial<ReactDebuggingProgress>) => void;
  saveReactDebuggingExplanation: (
    problemId: string,
    explanation: { rootCause: string; signal: string; edgeCase: string }
  ) => void;
  updateUnitTestingProgress: (problemId: string, patch: Partial<UnitTestingProgress>) => void;
  setUnitTestingStepStatus: (problemId: string, stepIndex: number, status: StepCompletion[number]) => void;
  saveUnitTestingExplanation: (
    problemId: string,
    explanation: { behaviorProof: string; edgeCase: string; brittleness: string }
  ) => void;
  addDrillAttempt: (attempt: DrillAttempt) => void;
  addMockSession: (session: SystemDesignMockSession) => void;
  addQuizSession: (session: QuizSession) => void;
  addAdaptivePlan: (plan: AdaptiveSessionPlan) => void;
  addAdaptiveRun: (run: AdaptiveSessionRun) => void;
};

export const getDefaultDataState = () => ({
  progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {}, reactDebugging: {}, unitTesting: {} },
  settings: initialSettings,
  overlayPack: null,
  overlayVersion: 0,
  drillAttempts: [],
  mockSessions: [],
  quizSessions: [],
  adaptivePlans: [],
  adaptiveRuns: [],
  storageStatus: 'idle' as StorageStatus,
  storageError: undefined as string | undefined
});

const shouldPersist = (status: StorageStatus) => status === 'ready';

export const useAppStore = create<AppState>()((set, get) => ({
  ...getDefaultDataState(),
  hydrateFromStorage: (payload) =>
    set((state) => ({
      progress: payload.progress
        ? {
            ...state.progress,
            ...payload.progress,
            problems: payload.progress.problems ?? state.progress.problems,
            systemDesign: payload.progress.systemDesign ?? state.progress.systemDesign,
            systemDesignDrills: payload.progress.systemDesignDrills ?? state.progress.systemDesignDrills,
            quizzes: payload.progress.quizzes ?? state.progress.quizzes,
            reactCoding: payload.progress.reactCoding ?? state.progress.reactCoding,
            reactDebugging: payload.progress.reactDebugging ?? state.progress.reactDebugging,
            unitTesting: payload.progress.unitTesting ?? state.progress.unitTesting
          }
        : state.progress,
      settings: payload.settings ?? state.settings,
      overlayPack: payload.overlayPack ?? state.overlayPack,
      drillAttempts: payload.drillAttempts ?? state.drillAttempts,
      mockSessions: payload.mockSessions ?? state.mockSessions,
      quizSessions: payload.quizSessions ?? state.quizSessions,
      adaptivePlans: payload.adaptivePlans ?? state.adaptivePlans,
      adaptiveRuns: payload.adaptiveRuns ?? state.adaptiveRuns
    })),
  setStorageStatus: (status, error) =>
    set(() => ({
      storageStatus: status,
      storageError: error
    })),
  updateProblemProgress: (problemId, patch) => {
    const current = get().progress.problems[problemId] ?? createDefaultProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        problems: {
          ...state.progress.problems,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setProblemProgress(problemId, next);
    }
  },
  setStepCompletion: (problemId, stepIndex, status) => {
    const current = get().progress.problems[problemId] ?? createDefaultProgress();
    const next = {
      ...current,
      stepCompletion: {
        ...current.stepCompletion,
        [stepIndex]: status
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        problems: {
          ...state.progress.problems,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setProblemProgress(problemId, next);
    }
  },
  resetProblem: (problemId) => {
    const next = createDefaultProgress();
    set((state) => ({
      progress: {
        ...state.progress,
        problems: {
          ...state.progress.problems,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setProblemProgress(problemId, next);
    }
  },
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    set(() => ({ settings: next }));
    if (shouldPersist(get().storageStatus)) {
      void setSettings(next);
    }
  },
  toggleOverlay: (enabled) => {
    const next = { ...get().settings, overlayEnabled: enabled };
    set((state) => ({
      settings: next,
      overlayVersion: state.overlayVersion + 1
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSettings(next);
    }
  },
  setOverlayPack: (pack) => {
    set((state) => ({
      overlayPack: pack,
      overlayVersion: state.overlayVersion + 1
    }));
    if (shouldPersist(get().storageStatus)) {
      if (pack) {
        void persistOverlayPack(pack);
      } else {
        void clearOverlayPack();
      }
    }
  },
  bumpOverlayVersion: () =>
    set((state) => ({
      overlayVersion: state.overlayVersion + 1
    })),
  saveExplanation: (problemId, explanation) => {
    const current = get().progress.problems[problemId] ?? createDefaultProgress();
    const updatedAt = new Date().toISOString();
    const existing = current.explanation;
    const history = current.explanationHistory ?? [];
    const nextHistory = existing ? [...history, existing] : history;
    const next = {
      ...current,
      explanation: { ...explanation, updatedAt },
      explanationHistory: nextHistory
    };
    set((state) => ({
      progress: {
        ...state.progress,
        problems: {
          ...state.progress.problems,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setProblemProgress(problemId, next);
    }
  },
  updateSystemDesignProgress: (promptId, patch) => {
    const current = get().progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesign: {
          ...state.progress.systemDesign,
          [promptId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignProgressEntry(promptId, next);
    }
  },
  setSystemDesignStepStatus: (promptId, stepIndex, status) => {
    const current = get().progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
    const next = {
      ...current,
      stepCompletion: {
        ...current.stepCompletion,
        [stepIndex]: status
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesign: {
          ...state.progress.systemDesign,
          [promptId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignProgressEntry(promptId, next);
    }
  },
  setSystemDesignRubricCheck: (promptId, itemId, checked) => {
    const current = get().progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
    const next = {
      ...current,
      rubricChecks: {
        ...current.rubricChecks,
        [itemId]: checked
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesign: {
          ...state.progress.systemDesign,
          [promptId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignProgressEntry(promptId, next);
    }
  },
  saveSystemDesignExplanation: (promptId, explanation) => {
    const current = get().progress.systemDesign[promptId] ?? createDefaultSystemDesignProgress();
    const updatedAt = new Date().toISOString();
    const existing = current.explanation;
    const history = current.explanationHistory ?? [];
    const nextHistory = existing ? [...history, existing] : history;
    const next = {
      ...current,
      explanation: { ...explanation, updatedAt },
      explanationHistory: nextHistory
    };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesign: {
          ...state.progress.systemDesign,
          [promptId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignProgressEntry(promptId, next);
    }
  },
  updateSystemDesignDrillProgress: (drillId, patch) => {
    const current = get().progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesignDrills: {
          ...state.progress.systemDesignDrills,
          [drillId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignDrillProgressEntry(drillId, next);
    }
  },
  setSystemDesignDrillStepStatus: (drillId, stepIndex, status) => {
    const current = get().progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
    const next = {
      ...current,
      stepCompletion: {
        ...current.stepCompletion,
        [stepIndex]: status
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesignDrills: {
          ...state.progress.systemDesignDrills,
          [drillId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignDrillProgressEntry(drillId, next);
    }
  },
  setSystemDesignDrillRubricCheck: (drillId, itemId, checked) => {
    const current = get().progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
    const next = {
      ...current,
      rubricChecks: {
        ...current.rubricChecks,
        [itemId]: checked
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesignDrills: {
          ...state.progress.systemDesignDrills,
          [drillId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignDrillProgressEntry(drillId, next);
    }
  },
  saveSystemDesignDrillExplanation: (drillId, explanation) => {
    const current = get().progress.systemDesignDrills[drillId] ?? createDefaultSystemDesignDrillProgress();
    const updatedAt = new Date().toISOString();
    const existing = current.explanation;
    const history = current.explanationHistory ?? [];
    const nextHistory = existing ? [...history, existing] : history;
    const next = {
      ...current,
      explanation: { ...explanation, updatedAt },
      explanationHistory: nextHistory
    };
    set((state) => ({
      progress: {
        ...state.progress,
        systemDesignDrills: {
          ...state.progress.systemDesignDrills,
          [drillId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setSystemDesignDrillProgressEntry(drillId, next);
    }
  },
  updateQuizProgress: (questionId, patch) => {
    const current = get().progress.quizzes[questionId] ?? createDefaultQuizProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        quizzes: {
          ...state.progress.quizzes,
          [questionId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setQuizProgressEntry(questionId, next);
    }
  },
  updateReactCodingProgress: (problemId, patch) => {
    const current = get().progress.reactCoding[problemId] ?? createDefaultReactCodingProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        reactCoding: {
          ...state.progress.reactCoding,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setReactCodingProgressEntry(problemId, next);
    }
  },
  setReactCodingStepStatus: (problemId, stepIndex, status) => {
    const current = get().progress.reactCoding[problemId] ?? createDefaultReactCodingProgress();
    const next = {
      ...current,
      stepCompletion: {
        ...current.stepCompletion,
        [stepIndex]: status
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        reactCoding: {
          ...state.progress.reactCoding,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setReactCodingProgressEntry(problemId, next);
    }
  },
  saveReactCodingExplanation: (problemId, explanation) => {
    const current = get().progress.reactCoding[problemId] ?? createDefaultReactCodingProgress();
    const updatedAt = new Date().toISOString();
    const existing = current.explanation;
    const history = current.explanationHistory ?? [];
    const nextHistory = existing ? [...history, existing] : history;
    const next = {
      ...current,
      explanation: { ...explanation, updatedAt },
      explanationHistory: nextHistory
    };
    set((state) => ({
      progress: {
        ...state.progress,
        reactCoding: {
          ...state.progress.reactCoding,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setReactCodingProgressEntry(problemId, next);
    }
  },
  updateReactDebuggingProgress: (problemId, patch) => {
    const current = get().progress.reactDebugging[problemId] ?? createDefaultReactDebuggingProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        reactDebugging: {
          ...state.progress.reactDebugging,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setReactDebuggingProgressEntry(problemId, next);
    }
  },
  saveReactDebuggingExplanation: (problemId, explanation) => {
    const current = get().progress.reactDebugging[problemId] ?? createDefaultReactDebuggingProgress();
    const updatedAt = new Date().toISOString();
    const existing = current.explanation;
    const history = current.explanationHistory ?? [];
    const nextHistory = existing ? [...history, existing] : history;
    const next = {
      ...current,
      explanation: { ...explanation, updatedAt },
      explanationHistory: nextHistory
    };
    set((state) => ({
      progress: {
        ...state.progress,
        reactDebugging: {
          ...state.progress.reactDebugging,
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setReactDebuggingProgressEntry(problemId, next);
    }
  },
  updateUnitTestingProgress: (problemId, patch) => {
    const current = get().progress.unitTesting?.[problemId] ?? createDefaultUnitTestingProgress();
    const next = { ...current, ...patch };
    set((state) => ({
      progress: {
        ...state.progress,
        unitTesting: {
          ...(state.progress.unitTesting ?? {}),
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setUnitTestingProgressEntry(problemId, next);
    }
  },
  setUnitTestingStepStatus: (problemId, stepIndex, status) => {
    const current = get().progress.unitTesting?.[problemId] ?? createDefaultUnitTestingProgress();
    const next = {
      ...current,
      stepCompletion: {
        ...current.stepCompletion,
        [stepIndex]: status
      }
    };
    set((state) => ({
      progress: {
        ...state.progress,
        unitTesting: {
          ...(state.progress.unitTesting ?? {}),
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setUnitTestingProgressEntry(problemId, next);
    }
  },
  saveUnitTestingExplanation: (problemId, explanation) => {
    const current = get().progress.unitTesting?.[problemId] ?? createDefaultUnitTestingProgress();
    const updatedAt = new Date().toISOString();
    const existing = current.explanation;
    const history = current.explanationHistory ?? [];
    const nextHistory = existing ? [...history, existing] : history;
    const next = {
      ...current,
      explanation: { ...explanation, updatedAt },
      explanationHistory: nextHistory
    };
    set((state) => ({
      progress: {
        ...state.progress,
        unitTesting: {
          ...(state.progress.unitTesting ?? {}),
          [problemId]: next
        }
      }
    }));
    if (shouldPersist(get().storageStatus)) {
      void setUnitTestingProgressEntry(problemId, next);
    }
  },
  addDrillAttempt: (attempt) => {
    set((state) => ({
      drillAttempts: [...state.drillAttempts, attempt]
    }));
    if (shouldPersist(get().storageStatus)) {
      void addDrillAttempt(attempt);
    }
  },
  addMockSession: (session) => {
    set((state) => ({
      mockSessions: [session, ...state.mockSessions]
    }));
    if (shouldPersist(get().storageStatus)) {
      void saveMockSession(session);
    }
  },
  addQuizSession: (session) => {
    set((state) => ({
      quizSessions: [session, ...state.quizSessions]
    }));
    if (shouldPersist(get().storageStatus)) {
      void saveQuizSession(session);
    }
  },
  addAdaptivePlan: (plan) => {
    set((state) => ({
      adaptivePlans: [plan, ...state.adaptivePlans]
    }));
    if (shouldPersist(get().storageStatus)) {
      void saveAdaptivePlan(plan);
    }
  },
  addAdaptiveRun: (run) => {
    set((state) => ({
      adaptiveRuns: [run, ...state.adaptiveRuns]
    }));
    if (shouldPersist(get().storageStatus)) {
      void saveAdaptiveRun(run);
    }
  }
}));

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

export const getReactCodingProgress = (state: ProgressState, problemId: string): ReactCodingProgress => {
  return state.reactCoding[problemId] ?? createDefaultReactCodingProgress();
};

export const getReactDebuggingProgress = (
  state: ProgressState,
  problemId: string
): ReactDebuggingProgress => {
  return state.reactDebugging[problemId] ?? createDefaultReactDebuggingProgress();
};

export const getUnitTestingProgress = (
  state: ProgressState,
  problemId: string
): UnitTestingProgress => {
  return state.unitTesting?.[problemId] ?? createDefaultUnitTestingProgress();
};
