import { openDatabase } from '../db';
import { DrillAttempt } from '../../lib/dsaDrillStorage';

export const getDrillAttempts = async () => {
  const db = await openDatabase();
  return await db.getAll('dsaDrillAttempts');
};

export const addDrillAttempt = async (attempt: DrillAttempt) => {
  const db = await openDatabase();
  const id = `${attempt.drillId}-${attempt.completedAt}`;
  await db.put('dsaDrillAttempts', attempt, id);
};

export const bulkAddDrillAttempts = async (attempts: DrillAttempt[]) => {
  const db = await openDatabase();
  const tx = db.transaction('dsaDrillAttempts', 'readwrite');
  await Promise.all(
    attempts.map((attempt) => tx.store.put(attempt, `${attempt.drillId}-${attempt.completedAt}`))
  );
  await tx.done;
};
