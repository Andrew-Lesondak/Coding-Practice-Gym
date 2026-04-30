import { QuizQuestion } from '../types/quiz';

const toChoiceMap = (question: QuizQuestion) =>
  new Map((question.choices ?? []).map((choice) => [choice.id, choice.text]));

const labelChoice = (question: QuizQuestion, id: string) => {
  const text = toChoiceMap(question).get(id);
  return text ? `${id}) ${text}` : id;
};

export const formatQuizAnswer = (question: QuizQuestion, answer: unknown): string => {
  if (question.type === 'true_false') {
    return answer === true ? 'True' : answer === false ? 'False' : 'No answer';
  }
  if (question.type === 'single_choice') {
    if (typeof answer !== 'string' || !answer) return 'No answer';
    return labelChoice(question, answer);
  }
  const ids = Array.isArray(answer) ? answer : [];
  if (ids.length === 0) return 'No answer';
  return ids.map((id) => labelChoice(question, String(id))).join(', ');
};

export const formatQuizCorrectAnswer = (question: QuizQuestion): string => {
  if (question.type === 'true_false') {
    return question.correct.true_false ? 'True' : 'False';
  }
  if (question.type === 'single_choice') {
    return labelChoice(question, question.correct.single_choice ?? '');
  }
  return (question.correct.multiple_choice ?? []).map((id) => labelChoice(question, id)).join(', ');
};

export const getQuizSelectionFeedback = (question: QuizQuestion, answer: unknown): string[] => {
  if (question.type === 'true_false') {
    if (typeof answer !== 'boolean') return ['You did not submit a True/False selection.'];
    return answer === question.correct.true_false
      ? ['Your selection matches the correct statement.']
      : ['Your selection flips the truth value of the statement.'];
  }

  if (question.type === 'single_choice') {
    const selected = typeof answer === 'string' ? answer : '';
    const correct = question.correct.single_choice ?? '';
    if (!selected) return ['You did not select an option.'];
    if (selected === correct) return ['You selected the correct option.'];
    return [
      `You chose ${labelChoice(question, selected)}.`,
      `The correct option is ${labelChoice(question, correct)}.`
    ];
  }

  const selected = new Set(Array.isArray(answer) ? answer.map(String) : []);
  const correct = new Set((question.correct.multiple_choice ?? []).map(String));
  if (selected.size === 0) return ['You did not select any options.'];

  const extra = [...selected].filter((id) => !correct.has(id));
  const missing = [...correct].filter((id) => !selected.has(id));

  const lines: string[] = [];
  if (extra.length > 0) {
    lines.push(`These selected options are not correct: ${extra.map((id) => labelChoice(question, id)).join(', ')}.`);
  }
  if (missing.length > 0) {
    lines.push(`You missed these correct options: ${missing.map((id) => labelChoice(question, id)).join(', ')}.`);
  }
  if (lines.length === 0) {
    lines.push('Your selected set exactly matches the correct set.');
  }
  return lines;
};
