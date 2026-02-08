import { openDatabase } from '../db';
import { ReactCodingProgress } from '../../types/reactCoding';

export const getReactCodingProgressEntry = async (problemId: string) => {
  const db = await openDatabase();
  return (await db.get('reactCoding', problemId)) ?? null;
};

export const setReactCodingProgressEntry = async (problemId: string, progress: ReactCodingProgress) => {
  const db = await openDatabase();
  await db.put('reactCoding', progress, problemId);
};

export const getAllReactCodingProgress = async () => {
  const db = await openDatabase();
  return await db.getAll('reactCoding');
};

export const bulkSetReactCodingProgress = async (entries: Record<string, ReactCodingProgress>) => {
  const db = await openDatabase();
  const tx = db.transaction('reactCoding', 'readwrite');
  await Promise.all(Object.entries(entries).map(([id, progress]) => tx.store.put(progress, id)));
  await tx.done;
};
