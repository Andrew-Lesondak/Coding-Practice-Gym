import type { StepCompletion } from './progress';

export type UnitTestingFile = {
  path: string;
  language: 'ts' | 'tsx' | 'js' | 'jsx';
  contents: string;
  editable: boolean;
};

export type UnitTestingMutant = {
  id: string;
  mutatedFiles: Array<{
    path: string;
    contents: string;
  }>;
  description?: string;
};

export type UnitTestingProblem = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'unit' | 'react-component';
  topics: string[];
  framework: 'vitest' | 'vitest-testing-library';
  promptMarkdown: string;
  requirements: string[];
  constraints: string[];
  sourceFiles: UnitTestingFile[];
  testStubFile: {
    path: string;
    language: 'ts' | 'tsx';
    contents: string;
  };
  referenceTestFile: {
    path: string;
    language: 'ts' | 'tsx';
    contents: string;
  };
  testsMeta: {
    visibleChecks: string[];
    hiddenChecks: string[];
  };
  commonPitfalls: string[];
  recallQuestions: string[];
  solutionNotes: {
    testingStrategyMarkdown: string;
    whyTheseAssertionsMarkdown: string;
    edgeCasesMarkdown: string;
  };
  hiddenMutants: UnitTestingMutant[];
};

export type UnitTestingProgress = {
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
  lastWeakFailureAt?: string;
  explanation?: {
    behaviorProof: string;
    edgeCase: string;
    brittleness: string;
    updatedAt: string;
  };
  explanationHistory?: {
    behaviorProof: string;
    edgeCase: string;
    brittleness: string;
    updatedAt: string;
  }[];
};
