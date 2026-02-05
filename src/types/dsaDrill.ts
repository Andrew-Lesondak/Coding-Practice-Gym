export type DSASpeedDrill = {
  id: string;
  problemId: string;
  drillType: 'pattern' | 'core-loop' | 'invariant' | 'bug-fix';
  difficulty: 'easy' | 'medium' | 'hard';
  promptMarkdown: string;
  starterCode: string;
  allowedEditRegions: { start: string; end: string }[];
  visibleTestsOnly: boolean;
  timeLimitMinutes: number;
  referenceSnippet: string;
  recallQuestions: string[];
};
