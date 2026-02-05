export type SystemDesignDrill = {
  id: string;
  title: string;
  type: 'requirements' | 'api' | 'data-scaling' | 'reliability' | 'tradeoffs';
  difficulty: 'easy' | 'medium' | 'hard';
  relatedPromptId?: string;
  promptMarkdown: string;
  stepsIncluded: number[];
  starterTemplateMarkdown: string;
  rubricSubset: {
    categoryIds: string[];
    itemIds: string[];
  };
  referenceNotes: string[];
  timeLimitMinutes: number;
  recallQuestions: string[];
};
