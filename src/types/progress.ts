export type StepCompletion = {
  [stepIndex: number]: boolean;
};

export type ProblemProgress = {
  attempts: number;
  passes: number;
  lastAttemptedAt?: string;
  lastPassedAt?: string;
  stepCompletion: StepCompletion;
  nextReviewAt?: string;
  reviewIntervalDays: number;
  easeFactor: number;
  lastRating?: {
    difficulty: number;
    confidence: number;
  };
};

export type ProgressState = {
  problems: Record<string, ProblemProgress>;
};

export type SettingsState = {
  languageMode: 'ts' | 'js';
  hintLevel: 0 | 1 | 2 | 3;
  lockSteps: boolean;
  overlayEnabled: boolean;
};
