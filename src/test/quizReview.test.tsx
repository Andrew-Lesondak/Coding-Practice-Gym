import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import QuizReview from '../pages/QuizReview';
import { saveQuizSession } from '../lib/quizStorage';
import { QuizQuestion } from '../types/quiz';

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'javascript',
    subtopic: 'closures',
    difficulty: 'easy',
    type: 'true_false',
    promptMarkdown: 'Is this true?',
    correct: { true_false: true },
    explanationMarkdown: 'Yes',
    tags: []
  }
];

vi.mock('../lib/useQuizQuestions', () => ({
  useQuizQuestions: () => questions
}));

describe('quiz review', () => {
  it('renders missed questions', () => {
    const sessionId = 'review-1';
    saveQuizSession({
      id: sessionId,
      questionIds: ['q1'],
      settings: {
        count: 1,
        topics: ['javascript'],
        difficulty: 'mixed',
        mode: 'exam',
        timed: false,
        secondsPerQuestion: 30
      },
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      answers: { q1: false },
      results: { q1: false },
      timePerQuestionSeconds: { q1: 5 }
    });

    render(
      <MemoryRouter initialEntries={[`/quizzes/review/${sessionId}`]}>
        <Routes>
          <Route path="/quizzes/review/:sessionId" element={<QuizReview />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Missed questions')).toBeInTheDocument();
    expect(screen.getByText('Is this true?')).toBeInTheDocument();
  });
});
