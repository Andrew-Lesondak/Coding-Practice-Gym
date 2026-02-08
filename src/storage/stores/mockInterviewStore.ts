import { openDatabase } from '../db';
import { SystemDesignMockSession } from '../../types/systemDesignMock';

export const getMockSessions = async () => {
  const db = await openDatabase();
  return await db.getAll('mockSessions');
};

export const saveMockSession = async (session: SystemDesignMockSession) => {
  const db = await openDatabase();
  await db.put('mockSessions', session, session.id);
};

export const bulkSaveMockSessions = async (sessions: SystemDesignMockSession[]) => {
  const db = await openDatabase();
  const tx = db.transaction('mockSessions', 'readwrite');
  await Promise.all(sessions.map((session) => tx.store.put(session, session.id)));
  await tx.done;
};
