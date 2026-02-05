import { SystemDesignMockSession } from '../types/systemDesignMock';

const KEY = 'dsa-gym-mock-sessions';

export const loadMockSessions = (): SystemDesignMockSession[] => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SystemDesignMockSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveMockSession = (session: SystemDesignMockSession) => {
  const all = loadMockSessions().filter((item) => item.id !== session.id);
  all.push(session);
  localStorage.setItem(KEY, JSON.stringify(all));
};

export const getMockSession = (id: string) => loadMockSessions().find((item) => item.id === id) ?? null;
