import { setProblemProgress, getProblemProgress } from '../storage/stores/dsaProgressStore';
import { setSystemDesignProgressEntry, getSystemDesignProgressEntry } from '../storage/stores/systemDesignStore';
import {
  setSystemDesignDrillProgressEntry,
  getSystemDesignDrillProgressEntry
} from '../storage/stores/systemDesignDrillsStore';
import { setQuizProgressEntry, getQuizProgressEntry } from '../storage/stores/quizProgressStore';
import { setReactCodingProgressEntry, getReactCodingProgressEntry } from '../storage/stores/reactCodingStore';
import { setSettings, getSettings } from '../storage/stores/settingsStore';
import { setOverlayPack, getOverlayPack, clearOverlayPack } from '../storage/stores/overlayPackStore';
import { addDrillAttempt, getDrillAttempts } from '../storage/stores/dsaDrillsStore';
import { saveMockSession, getMockSessions } from '../storage/stores/mockInterviewStore';
import { saveQuizSession, getQuizSessions } from '../storage/stores/quizSessionStore';
import { saveAdaptivePlan, saveAdaptiveRun, getAdaptivePlans, getAdaptiveRuns } from '../storage/stores/adaptiveSessionStore';
import { setDraft, getDraft } from '../storage/stores/editorDraftStore';
import { resetDatabaseHard } from '../storage/db';

describe('storage stores', () => {
  beforeEach(async () => {
    await resetDatabaseHard();
  });

  it('writes and reads all stores', async () => {
    await setProblemProgress('demo', {
      attempts: 1,
      passes: 0,
      stepCompletion: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3,
      explanationHistory: []
    });
    await setSystemDesignProgressEntry('sd', {
      attempts: 1,
      passes: 0,
      stepCompletion: {},
      rubricChecks: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3,
      explanationHistory: []
    });
    await setSystemDesignDrillProgressEntry('sd-drill', {
      attempts: 1,
      stepCompletion: {},
      rubricChecks: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3,
      explanationHistory: []
    });
    await setQuizProgressEntry('quiz-1', { attempts: 1, correctCount: 1, reviewIntervalDays: 2, easeFactor: 2.3 });
    await setReactCodingProgressEntry('react-1', {
      attempts: 1,
      passes: 1,
      stepCompletion: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3,
      explanationHistory: []
    });
    await setSettings({ languageMode: 'js', hintLevel: 2, lockSteps: false, overlayEnabled: true });
    await setOverlayPack({ problems: [], updatedAt: new Date().toISOString(), version: 1 });
    await addDrillAttempt({
      drillId: 'd1',
      problemId: 'p1',
      drillType: 'pattern',
      difficulty: 'easy',
      completedAt: new Date().toISOString(),
      durationSeconds: 30,
      passed: true,
      confidence: 3
    });
    await saveMockSession({
      id: 'm1',
      promptId: 'p1',
      drills: { requirementsDrillId: 'd1', apiDrillId: 'd2', scalingDrillId: 'd3' },
      phaseIndex: 0,
      phaseStartedAt: Date.now(),
      phaseTimeRemainingSeconds: 60,
      responses: { drillResponses: {}, fullDesignResponse: { content: '', rubricChecks: {}, completedAt: Date.now() } },
      scores: { drillScores: {}, fullDesignScore: 0 }
    });
    await saveQuizSession({
      id: 'q1',
      questionIds: [],
      settings: {
        count: 10,
        difficulty: 'mixed',
        mode: 'immediate',
        topics: ['javascript'],
        timed: false,
        secondsPerQuestion: 30
      },
      startedAt: new Date().toISOString(),
      answers: {},
      results: {},
      timePerQuestionSeconds: {}
    });
    await saveAdaptivePlan({
      id: 'plan-1',
      createdAt: Date.now(),
      mode: 'dsa',
      lengthMinutes: 15,
      intensity: 'chill',
      blocks: [],
      summary: { primaryFocus: [], dueReviewCount: 0, estimatedTotalMinutes: 15 },
      seed: 1
    });
    await saveAdaptiveRun({
      sessionId: 'run-1',
      planId: 'plan-1',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      outcomes: []
    });
    await setDraft('coding-practice-gym-code-demo-ts', 'const x = 1;');

    expect((await getProblemProgress('demo'))?.attempts).toBe(1);
    expect((await getSystemDesignProgressEntry('sd'))?.attempts).toBe(1);
    expect((await getSystemDesignDrillProgressEntry('sd-drill'))?.attempts).toBe(1);
    expect((await getQuizProgressEntry('quiz-1'))?.correctCount).toBe(1);
    expect((await getReactCodingProgressEntry('react-1'))?.passes).toBe(1);
    expect((await getSettings())?.languageMode).toBe('js');
    expect((await getOverlayPack())?.version).toBe(1);
    expect((await getDrillAttempts()).length).toBe(1);
    expect((await getMockSessions()).length).toBe(1);
    expect((await getQuizSessions()).length).toBe(1);
    expect((await getAdaptivePlans()).length).toBe(1);
    expect((await getAdaptiveRuns()).length).toBe(1);
    expect((await getDraft('coding-practice-gym-code-demo-ts'))?.value).toBe('const x = 1;');

    await clearOverlayPack();
    expect(await getOverlayPack()).toBeNull();
  });
});
