import { QuizQuestion, QuizQuestionType, QuizProgress } from '../types/quiz';

export const gradeQuizAnswer = (
  question: QuizQuestion,
  answer: boolean | string | string[]
): boolean => {
  if (question.type === 'true_false') {
    return Boolean(answer) === Boolean(question.correct.true_false);
  }
  if (question.type === 'single_choice') {
    return String(answer) === String(question.correct.single_choice);
  }
  const expected = (question.correct.multiple_choice ?? []).slice().sort();
  const actual = Array.isArray(answer) ? answer.slice().sort() : [];
  if (expected.length !== actual.length) return false;
  return expected.every((item, index) => item === actual[index]);
};

export type QuizSelectionConfig = {
  count: number;
  topics: QuizQuestion['topic'][];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
};

const getAccuracy = (progress?: QuizProgress) =>
  progress && progress.attempts ? progress.correctCount / progress.attempts : 0;

export const selectQuizQuestions = (
  questions: QuizQuestion[],
  progress: Record<string, QuizProgress>,
  config: QuizSelectionConfig
): QuizQuestion[] => {
  const now = Date.now();
  const filtered = questions.filter((question) => {
    const topicMatch = config.topics.length === 0 || config.topics.includes(question.topic);
    const difficultyMatch = config.difficulty === 'mixed' || question.difficulty === config.difficulty;
    return topicMatch && difficultyMatch;
  });

  const due = filtered
    .filter((question) => {
      const p = progress[question.id];
      if (!p?.nextReviewAt) return false;
      return new Date(p.nextReviewAt).getTime() <= now;
    })
    .sort((a, b) => {
      const aTime = new Date(progress[a.id]?.nextReviewAt ?? 0).getTime();
      const bTime = new Date(progress[b.id]?.nextReviewAt ?? 0).getTime();
      return aTime - bTime || a.id.localeCompare(b.id);
    });

  const weak = filtered
    .filter((question) => {
      const p = progress[question.id];
      return p && p.attempts >= 3 && getAccuracy(p) < 0.6;
    })
    .sort((a, b) => getAccuracy(progress[a.id]) - getAccuracy(progress[b.id]) || a.id.localeCompare(b.id));

  const fresh = filtered
    .filter((question) => !progress[question.id])
    .sort((a, b) => a.id.localeCompare(b.id));

  const rest = filtered
    .filter((question) => !due.includes(question) && !weak.includes(question) && !fresh.includes(question))
    .sort((a, b) => a.id.localeCompare(b.id));

  const selected: QuizQuestion[] = [];
  const pushUnique = (list: QuizQuestion[]) => {
    list.forEach((item) => {
      if (selected.length >= config.count) return;
      if (!selected.find((q) => q.id === item.id)) {
        selected.push(item);
      }
    });
  };

  pushUnique(due);
  pushUnique(weak);
  pushUnique(fresh);
  pushUnique(rest);

  return selected.slice(0, config.count);
};

export const getQuizTypeLabel = (type: QuizQuestionType) => {
  switch (type) {
    case 'true_false':
      return 'True/False';
    case 'single_choice':
      return 'Single choice';
    case 'multiple_choice':
      return 'Multiple choice';
    default:
      return 'Quiz';
  }
};
