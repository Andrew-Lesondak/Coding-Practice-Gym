import { openDatabase } from '../db';
import { ProblemProgress } from '../../types/progress';

export const getProblemProgress = async (problemId: string) => {
  const db = await openDatabase();
  return (await db.get('dsaProgress', problemId)) ?? null;
};

export const setProblemProgress = async (problemId: string, progress: ProblemProgress) => {
  const db = await openDatabase();
  await db.put('dsaProgress', progress, problemId);
};

export const getAllProblemProgress = async () => {
  const db = await openDatabase();
  return await db.getAll('dsaProgress');
};

export const getAllProblemProgressEntries = async () => {
  const db = await openDatabase();
  return await db.getAllKeys('dsaProgress');
};

export const bulkSetProblemProgress = async (entries: Record<string, ProblemProgress>) => {
  const db = await openDatabase();
  const tx = db.transaction('dsaProgress', 'readwrite');
  await Promise.all(Object.entries(entries).map(([id, progress]) => tx.store.put(progress, id)));
  await tx.done;
};
