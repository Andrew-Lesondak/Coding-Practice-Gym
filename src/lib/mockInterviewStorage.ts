import { SystemDesignMockSession } from '../types/systemDesignMock';
import { useAppStore } from '../store/useAppStore';

export const loadMockSessions = (): SystemDesignMockSession[] => {
  return useAppStore.getState().mockSessions;
};

export const saveMockSession = (session: SystemDesignMockSession) => {
  useAppStore.getState().addMockSession(session);
};

export const getMockSession = (id: string) => loadMockSessions().find((item) => item.id === id) ?? null;
