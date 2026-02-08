import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import QuizSession from '../pages/QuizSession';
import { saveQuizSession } from '../lib/quizStorage';
import { QuizQuestion } from '../types/quiz';

const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q-single',
    topic: 'javascript',
    subtopic: 'closures',
    difficulty: 'easy',
    type: 'single_choice',
    promptMarkdown: 'Pick one',
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' }
    ],
    correct: { single_choice: 'a' },
    explanationMarkdown: 'Because A',
    tags: []
  },
  {
    id: 'q-multi',
    topic: 'react',
    subtopic: 'hooks',
    difficulty: 'easy',
    type: 'multiple_choice',
    promptMarkdown: 'Pick many',
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
      { id: 'c', text: 'C' }
    ],
    correct: { multiple_choice: ['a', 'c'] },
    explanationMarkdown: 'Because A+C',
    tags: []
  }
];

vi.mock('../lib/useQuizQuestions', () => ({
  useQuizQuestions: () => sampleQuestions
}));

describe('quiz session interactions', () => {
  it('single choice selection + submit shows feedback', () => {
    const sessionId = 'session-1';
    saveQuizSession({
      id: sessionId,
      questionIds: ['q-single'],
      settings: {
        count: 1,
        topics: ['javascript'],
        difficulty: 'mixed',
        mode: 'immediate',
        timed: false,
        secondsPerQuestion: 30
      },
      startedAt: new Date().toISOString(),
      answers: {},
      results: {},
      timePerQuestionSeconds: {}
    });

    render(
      <MemoryRouter initialEntries={[`/quizzes/session?id=${sessionId}`]}>
        <Routes>
          <Route path="/quizzes/session" element={<QuizSession />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Correct')).toBeInTheDocument();
  });

  it('multiple choice selection + submit shows feedback', () => {
    const sessionId = 'session-2';
    saveQuizSession({
      id: sessionId,
      questionIds: ['q-multi'],
      settings: {
        count: 1,
        topics: ['react'],
        difficulty: 'mixed',
        mode: 'immediate',
        timed: false,
        secondsPerQuestion: 30
      },
      startedAt: new Date().toISOString(),
      answers: {},
      results: {},
      timePerQuestionSeconds: {}
    });

    render(
      <MemoryRouter initialEntries={[`/quizzes/session?id=${sessionId}`]}>
        <Routes>
          <Route path="/quizzes/session" element={<QuizSession />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('C'));
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Correct')).toBeInTheDocument();
  });
});
