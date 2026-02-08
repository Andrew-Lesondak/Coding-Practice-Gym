import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import QuizCatalog from '../pages/QuizCatalog';
import { QuizQuestion } from '../types/quiz';

const questions: QuizQuestion[] = [
  {
    id: 'q-js',
    topic: 'javascript',
    subtopic: 'closures',
    difficulty: 'easy',
    type: 'true_false',
    promptMarkdown: 'JS question',
    correct: { true_false: true },
    explanationMarkdown: 'ex',
    tags: []
  },
  {
    id: 'q-react',
    topic: 'react',
    subtopic: 'hooks',
    difficulty: 'hard',
    type: 'single_choice',
    promptMarkdown: 'React question',
    choices: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' }
    ],
    correct: { single_choice: 'a' },
    explanationMarkdown: 'ex',
    tags: []
  }
];

vi.mock('../lib/useQuizQuestions', () => ({
  useQuizQuestions: () => questions
}));

describe('quiz catalog filters', () => {
  it('filters by topic', () => {
    render(
      <MemoryRouter>
        <QuizCatalog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Topic'), { target: { value: 'javascript' } });
    expect(screen.getByText('JS question')).toBeInTheDocument();
    expect(screen.queryByText('React question')).toBeNull();
  });
});
