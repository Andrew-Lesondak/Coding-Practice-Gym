export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export type StepCompletion = {
  [stepIndex: number]: StepStatus;
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
  explanation?: {
    pattern: string;
    why: string;
    complexity: string;
    updatedAt: string;
  };
  explanationHistory?: {
    pattern: string;
    why: string;
    complexity: string;
    updatedAt: string;
  }[];
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
