import { QuizSession } from '../types/quiz';
import { useAppStore } from '../store/useAppStore';

export const loadQuizSessions = (): QuizSession[] => {
  return useAppStore.getState().quizSessions;
};

export const saveQuizSession = (session: QuizSession) => {
  useAppStore.getState().addQuizSession(session);
};

export const getQuizSession = (sessionId: string) => {
  const sessions = loadQuizSessions();
  return sessions.find((session) => session.id === sessionId) ?? null;
};
