import { StepCompletion } from './progress';

export type ReactCodingProblem = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  promptMarkdown: string;
  requirements: string[];
  constraints: string[];
  guidedStubTsx: string;
  referenceSolutionTsx: string;
  tests: {
    visible: string;
    hidden: string;
  };
  metadata: {
    timeComplexity?: string;
    commonPitfalls: string[];
    recallQuestions: string[];
  };
};

export type ReactCodingProgress = {
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
    concept: string;
    edgeCase: string;
    reviewWatch: string;
    updatedAt: string;
  };
  explanationHistory?: {
    concept: string;
    edgeCase: string;
    reviewWatch: string;
    updatedAt: string;
  }[];
};
