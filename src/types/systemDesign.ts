export type SystemDesignPrompt = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
  tags: string[];
  promptMarkdown: string;
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  scale: {
    traffic: string;
    storage: string;
    retention: string;
    notes?: string[];
  };
  constraints: string[];
  guidedDesignStubMarkdown: string;
  rubric: {
    categories: Array<{
      id: string;
      title: string;
      weight: number;
      items: Array<{
        id: string;
        text: string;
        weight: number;
        suggestionKeywords?: string[];
      }>;
    }>;
  };
  reference: {
    overviewMarkdown: string;
    keyDecisions: Array<{ decision: string; why: string; alternatives: string[] }>;
  };
  recallQuestions: string[];
  commonPitfalls: string[];
};
