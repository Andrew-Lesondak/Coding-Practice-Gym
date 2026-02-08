export type QuizQuestionType = 'true_false' | 'single_choice' | 'multiple_choice';

export type QuizTopic = 'javascript' | 'react' | 'typescript' | 'web';

export type QuizChoice = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  topic: QuizTopic;
  subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuizQuestionType;
  promptMarkdown: string;
  choices?: QuizChoice[];
  correct: {
    true_false?: boolean;
    single_choice?: string;
    multiple_choice?: string[];
  };
  explanationMarkdown: string;
  references?: string[];
  tags: string[];
  createdAt?: number;
};

export type QuizPack = {
  questions: QuizQuestion[];
  updatedAt: string;
  version: number;
};

export type QuizSession = {
  id: string;
  questionIds: string[];
  settings: {
    count: number;
    topics: QuizTopic[];
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    mode: 'immediate' | 'exam';
    timed: boolean;
    secondsPerQuestion: number;
  };
  startedAt: string;
  finishedAt?: string;
  answers: Record<string, string[] | string | boolean>;
  results: Record<string, boolean>;
  timePerQuestionSeconds: Record<string, number>;
  confidence?: number;
};

export type QuizProgress = {
  attempts: number;
  correctCount: number;
  lastAnsweredAt?: string;
  lastResult?: 'correct' | 'incorrect';
  nextReviewAt?: string;
  reviewIntervalDays: number;
  easeFactor: number;
};
