export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Example = {
  input: string;
  output: string;
  explanation?: string;
};

export type TestCase = {
  name: string;
  input: string; // JSON array of arguments
  expected: string; // JSON value
};

export type ProblemMetadata = {
  timeComplexity: string;
  spaceComplexity: string;
  commonPitfalls: string[];
  recallQuestions: string[];
};

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  patterns: string[];
  statementMarkdown: string;
  planMarkdown: string;
  examples: Example[];
  constraints: string[];
  functionName: string;
  inputFormat?: 'plain' | 'linked-list' | 'binary-tree';
  outputFormat?: 'plain' | 'linked-list' | 'binary-tree';
  referenceSolution: string;
  guidedStub: string;
  tests: {
    visible: TestCase[];
    hidden: TestCase[];
  };
  metadata: ProblemMetadata;
};

export type ProblemPack = {
  problems: Problem[];
  updatedAt: string;
  version: number;
};

export type Step = {
  index: number;
  title: string;
  description: string;
};

export type TodoRegion = {
  stepIndex: number;
  start: number;
  end: number;
  originalContent: string;
};
