import { QuizSession } from '../types/quiz';

const QUIZ_SESSIONS_KEY = 'dsa-gym-quiz-sessions';

export const loadQuizSessions = (): QuizSession[] => {
  const raw = localStorage.getItem(QUIZ_SESSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as QuizSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveQuizSession = (session: QuizSession) => {
  const sessions = loadQuizSessions();
  const existingIndex = sessions.findIndex((item) => item.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(QUIZ_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 200)));
};

export const getQuizSession = (sessionId: string) => {
  const sessions = loadQuizSessions();
  return sessions.find((session) => session.id === sessionId) ?? null;
};
