import { openDatabase } from '../db';
import { QuizProgress } from '../../types/quiz';

export const getQuizProgressEntry = async (questionId: string) => {
  const db = await openDatabase();
  return (await db.get('quizzes', questionId)) ?? null;
};

export const setQuizProgressEntry = async (questionId: string, progress: QuizProgress) => {
  const db = await openDatabase();
  await db.put('quizzes', progress, questionId);
};

export const getAllQuizProgress = async () => {
  const db = await openDatabase();
  return await db.getAll('quizzes');
};

export const bulkSetQuizProgress = async (entries: Record<string, QuizProgress>) => {
  const db = await openDatabase();
  const tx = db.transaction('quizzes', 'readwrite');
  await Promise.all(Object.entries(entries).map(([id, progress]) => tx.store.put(progress, id)));
  await tx.done;
};
