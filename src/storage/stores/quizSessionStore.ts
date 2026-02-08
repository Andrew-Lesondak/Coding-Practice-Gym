import { openDatabase } from '../db';
import { QuizSession } from '../../types/quiz';

export const getQuizSessions = async () => {
  const db = await openDatabase();
  return await db.getAll('quizSessions');
};

export const saveQuizSession = async (session: QuizSession) => {
  const db = await openDatabase();
  await db.put('quizSessions', session, session.id);
};

export const bulkSaveQuizSessions = async (sessions: QuizSession[]) => {
  const db = await openDatabase();
  const tx = db.transaction('quizSessions', 'readwrite');
  await Promise.all(sessions.map((session) => tx.store.put(session, session.id)));
  await tx.done;
};
