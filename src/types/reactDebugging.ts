export type ReactDebuggingFile = {
  path: string;
  language: 'tsx' | 'ts' | 'css' | 'json';
  contents: string;
  editable: boolean;
};

export type ReactDebuggingProblem = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  bugTypes: string[];
  briefMarkdown: string;
  codebase: {
    files: ReactDebuggingFile[];
  };
  entryFile: string;
  tests: {
    visible: string;
    hidden: string;
  };
  reproductionHints: string[];
  maintainabilityNotes: string[];
  solutionNotes: {
    rootCauseMarkdown: string;
    fixSummaryMarkdown: string;
    edgeCasesMarkdown: string;
  };
  recallQuestions: string[];
  metadata: {
    estimatedMinutes: number;
  };
  allowedEditablePaths?: string[];
  forbiddenPaths?: string[];
};

export type ReactDebuggingProgress = {
  attempts: number;
  passes: number;
  lastAttemptedAt?: string;
  lastPassedAt?: string;
  lastVisiblePassAt?: string;
  firstVisiblePassAt?: string;
  startedAt?: string;
  nextReviewAt?: string;
  reviewIntervalDays: number;
  easeFactor: number;
  lastRating?: {
    difficulty: number;
    confidence: number;
  };
  explanation?: {
    rootCause: string;
    signal: string;
    edgeCase: string;
    updatedAt: string;
  };
  explanationHistory?: {
    rootCause: string;
    signal: string;
    edgeCase: string;
    updatedAt: string;
  }[];
};
