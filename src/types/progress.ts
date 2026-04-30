import { QuizProgress } from './quiz';
import { ReactCodingProgress } from './reactCoding';
import { ReactDebuggingProgress } from './reactDebugging';
import { UnitTestingProgress } from './unitTesting';

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
  systemDesign: Record<string, SystemDesignProgress>;
  systemDesignDrills: Record<string, SystemDesignDrillProgress>;
  quizzes: Record<string, QuizProgress>;
  reactCoding: Record<string, ReactCodingProgress>;
  reactDebugging: Record<string, ReactDebuggingProgress>;
  unitTesting?: Record<string, UnitTestingProgress>;
};

export type SystemDesignProgress = {
  attempts: number;
  passes: number;
  lastAttemptedAt?: string;
  lastCompletedAt?: string;
  stepCompletion: StepCompletion;
  rubricChecks: Record<string, boolean>;
  nextReviewAt?: string;
  reviewIntervalDays: number;
  easeFactor: number;
  lastRating?: {
    difficulty: number;
    confidence: number;
  };
  explanation?: {
    tradeoff: string;
    risk: string;
    scaleChange: string;
    updatedAt: string;
  };
  explanationHistory?: {
    tradeoff: string;
    risk: string;
    scaleChange: string;
    updatedAt: string;
  }[];
  sectionSnapshot?: {
    stepNumber: number;
    title: string;
    textContent: string;
  }[];
  lastRubricScoreSnapshot?: {
    categoryScores: Record<string, number>;
    overall: number;
  };
  lastCompareViewedAt?: string;
};

export type SystemDesignDrillProgress = {
  attempts: number;
  lastAttemptedAt?: string;
  lastScore?: number;
  confidence?: number;
  nextReviewAt?: string;
  reviewIntervalDays: number;
  easeFactor: number;
  stepCompletion: StepCompletion;
  rubricChecks: Record<string, boolean>;
  explanation?: {
    decision: string;
    risk: string;
    updatedAt: string;
  };
  explanationHistory?: {
    decision: string;
    risk: string;
    updatedAt: string;
  }[];
};

export type SettingsState = {
  languageMode: 'ts' | 'js';
  hintLevel: 0 | 1 | 2 | 3;
  lockSteps: boolean;
  overlayEnabled: boolean;
  theme?: 'dark' | 'light';
};
