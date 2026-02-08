import { gradeQuizAnswer, selectQuizQuestions } from '../lib/quizEngine';
import { QuizQuestion, QuizProgress } from '../types/quiz';

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'javascript',
    subtopic: 'closures',
    difficulty: 'easy',
    type: 'true_false',
    promptMarkdown: 'TF?',
    correct: { true_false: true },
    explanationMarkdown: 'ex',
    tags: []
  },
  {
    id: 'q2',
    topic: 'javascript',
    subtopic: 'promises',
    difficulty: 'easy',
    type: 'single_choice',
    promptMarkdown: 'SC?',
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' }
    ],
    correct: { single_choice: 'a' },
    explanationMarkdown: 'ex',
    tags: []
  },
  {
    id: 'q3',
    topic: 'javascript',
    subtopic: 'event-loop',
    difficulty: 'easy',
    type: 'multiple_choice',
    promptMarkdown: 'MC?',
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'C' }
    ],
    correct: { multiple_choice: ['a', 'c'] },
    explanationMarkdown: 'ex',
    tags: []
  }
];

describe('quiz grading', () => {
  it('grades true/false', () => {
    expect(gradeQuizAnswer(questions[0], true)).toBe(true);
    expect(gradeQuizAnswer(questions[0], false)).toBe(false);
  });

  it('grades single choice', () => {
    expect(gradeQuizAnswer(questions[1], 'a')).toBe(true);
    expect(gradeQuizAnswer(questions[1], 'b')).toBe(false);
  });

  it('grades multiple choice', () => {
    expect(gradeQuizAnswer(questions[2], ['a', 'c'])).toBe(true);
    expect(gradeQuizAnswer(questions[2], ['c', 'a'])).toBe(true);
    expect(gradeQuizAnswer(questions[2], ['a'])).toBe(false);
  });
});

describe('quiz selection prioritization', () => {
  it('prioritizes due questions', () => {
    const progress: Record<string, QuizProgress> = {
      q1: {
        attempts: 3,
        correctCount: 3,
        reviewIntervalDays: 2,
        easeFactor: 2,
        nextReviewAt: new Date(Date.now() - 1000).toISOString()
      }
    };
    const selected = selectQuizQuestions(questions, progress, {
      count: 1,
      topics: ['javascript'],
      difficulty: 'mixed'
    });
    expect(selected[0].id).toBe('q1');
  });

  it('prioritizes weak over new', () => {
    const progress: Record<string, QuizProgress> = {
      q2: {
        attempts: 3,
        correctCount: 0,
        reviewIntervalDays: 2,
        easeFactor: 2
      }
    };
    const selected = selectQuizQuestions(questions, progress, {
      count: 1,
      topics: ['javascript'],
      difficulty: 'mixed'
    });
    expect(selected[0].id).toBe('q2');
  });
});
