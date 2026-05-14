import type { StepCompletion } from './progress';

export type DataStructureProblem = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  structures: string[];
  operations: string[];
  promptMarkdown: string;
  requirements: string[];
  constraints: string[];
  guidedStubTs: string;
  referenceSolutionTs: string;
  tests: {
    visible: string;
    hidden: string;
  };
  metadata: {
    expectedComplexities: Array<{
      operation: string;
      time: string;
      space?: string;
    }>;
    commonPitfalls: string[];
    recallQuestions: string[];
    invariants: string[];
  };
};

export type DataStructureProgress = {
  attempts: number;
  passes: number;
  lastAttemptedAt?: string;
  lastPassedAt?: string;
  stepCompletion: StepCompletion;
  startedAt?: string;
  nextReviewAt?: string;
  reviewIntervalDays: number;
  easeFactor: number;
  lastRating?: {
    difficulty: number;
    confidence: number;
  };
  explanation?: {
    invariant: string;
    operation: string;
    edgeCase: string;
    updatedAt: string;
  };
  explanationHistory?: {
    invariant: string;
    operation: string;
    edgeCase: string;
    updatedAt: string;
  }[];
};
