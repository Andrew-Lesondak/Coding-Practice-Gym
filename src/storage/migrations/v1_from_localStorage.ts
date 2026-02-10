import { OverlayPack } from '../../lib/problemPack';
import { DrillAttempt } from '../../lib/dsaDrillStorage';
import { QuizSession } from '../../types/quiz';
import { SystemDesignMockSession } from '../../types/systemDesignMock';
import { AdaptiveSessionPlan, AdaptiveSessionRun } from '../../types/adaptive';
import { ProgressState, SettingsState } from '../../types/progress';
import { bulkSetProblemProgress } from '../stores/dsaProgressStore';
import { bulkSetSystemDesignProgress } from '../stores/systemDesignStore';
import { bulkSetSystemDesignDrillProgress } from '../stores/systemDesignDrillsStore';
import { bulkSetQuizProgress } from '../stores/quizProgressStore';
import { bulkSetReactCodingProgress } from '../stores/reactCodingStore';
import { setSettings } from '../stores/settingsStore';
import { setOverlayPack } from '../stores/overlayPackStore';
import { bulkAddDrillAttempts } from '../stores/dsaDrillsStore';
import { bulkSaveMockSessions } from '../stores/mockInterviewStore';
import { bulkSaveQuizSessions } from '../stores/quizSessionStore';
import { bulkSaveAdaptivePlans, bulkSaveAdaptiveRuns } from '../stores/adaptiveSessionStore';
import { bulkSetDrafts } from '../stores/editorDraftStore';

const safeParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const legacyStoreKey = 'coding-practice-gym-store';
const overlayPackKey = 'coding-practice-gym-overlay-pack';
const overlayEnabledKey = 'coding-practice-gym-overlay-enabled';
const drillAttemptsKey = 'dsa-speed-drill-attempts';
const quizSessionsKey = 'coding-practice-gym-quiz-sessions';
const mockSessionsKey = 'coding-practice-gym-mock-sessions';
const adaptivePlansKey = 'coding-practice-gym-adaptive-plans';
const adaptiveRunsKey = 'coding-practice-gym-adaptive-runs';

type LegacyPersisted = {
  state?: {
    progress?: ProgressState;
    settings?: SettingsState;
    overlayVersion?: number;
  };
};

const collectDrafts = () => {
  const drafts: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (
      key.startsWith('coding-practice-gym-code-') ||
      key.startsWith('coding-practice-gym-sd-') ||
      key.startsWith('coding-practice-gym-sd-mermaid-') ||
      key.startsWith('coding-practice-gym-drill-') ||
      key.startsWith('react-gym-code-')
    ) {
      const value = localStorage.getItem(key);
      if (value !== null) drafts[key] = value;
    }
  }
  return drafts;
};

export const extractLegacyState = () => {
  const legacy = safeParse<LegacyPersisted>(localStorage.getItem(legacyStoreKey));
  const legacyProgress = legacy?.state?.progress ?? null;
  const legacySettings = legacy?.state?.settings ?? null;
  const overlayEnabled = localStorage.getItem(overlayEnabledKey);
  const overlay = safeParse<OverlayPack>(localStorage.getItem(overlayPackKey));
  const drillAttempts = safeParse<DrillAttempt[]>(localStorage.getItem(drillAttemptsKey));
  const quizSessions = safeParse<QuizSession[]>(localStorage.getItem(quizSessionsKey));
  const mockSessions = safeParse<SystemDesignMockSession[]>(localStorage.getItem(mockSessionsKey));
  const adaptivePlans = safeParse<AdaptiveSessionPlan[]>(localStorage.getItem(adaptivePlansKey));
  const adaptiveRuns = safeParse<AdaptiveSessionRun[]>(localStorage.getItem(adaptiveRunsKey));
  const drafts = collectDrafts();

  return {
    progress: legacyProgress ?? null,
    settings: legacySettings
      ? ({
          ...legacySettings,
          overlayEnabled: overlayEnabled ? overlayEnabled === 'true' : legacySettings.overlayEnabled ?? false
        } as SettingsState)
      : null,
    overlay,
    drillAttempts: Array.isArray(drillAttempts) ? drillAttempts : [],
    quizSessions: Array.isArray(quizSessions) ? quizSessions : [],
    mockSessions: Array.isArray(mockSessions) ? mockSessions : [],
    adaptivePlans: Array.isArray(adaptivePlans) ? adaptivePlans : [],
    adaptiveRuns: Array.isArray(adaptiveRuns) ? adaptiveRuns : [],
    drafts
  };
};

export const migrateFromLocalStorage = async () => {
  const extracted = extractLegacyState();
  if (extracted.progress) {
    await bulkSetProblemProgress(extracted.progress.problems ?? {});
    await bulkSetSystemDesignProgress(extracted.progress.systemDesign ?? {});
    await bulkSetSystemDesignDrillProgress(extracted.progress.systemDesignDrills ?? {});
    await bulkSetQuizProgress(extracted.progress.quizzes ?? {});
    await bulkSetReactCodingProgress(extracted.progress.reactCoding ?? {});
  }

  if (extracted.settings) {
    await setSettings(extracted.settings);
  }

  if (extracted.overlay) {
    await setOverlayPack(extracted.overlay);
  }

  if (extracted.drillAttempts.length > 0) {
    await bulkAddDrillAttempts(extracted.drillAttempts);
  }

  if (extracted.quizSessions.length > 0) {
    await bulkSaveQuizSessions(extracted.quizSessions);
  }

  if (extracted.mockSessions.length > 0) {
    await bulkSaveMockSessions(extracted.mockSessions);
  }

  if (extracted.adaptivePlans.length > 0) {
    await bulkSaveAdaptivePlans(extracted.adaptivePlans);
  }

  if (extracted.adaptiveRuns.length > 0) {
    await bulkSaveAdaptiveRuns(extracted.adaptiveRuns);
  }

  if (Object.keys(extracted.drafts).length > 0) {
    await bulkSetDrafts(extracted.drafts);
  }
};
