import { openDatabase } from '../db';
import { SystemDesignProgress } from '../../types/progress';

export const getSystemDesignProgressEntry = async (promptId: string) => {
  const db = await openDatabase();
  return (await db.get('systemDesign', promptId)) ?? null;
};

export const setSystemDesignProgressEntry = async (promptId: string, progress: SystemDesignProgress) => {
  const db = await openDatabase();
  await db.put('systemDesign', progress, promptId);
};

export const getAllSystemDesignProgress = async () => {
  const db = await openDatabase();
  return await db.getAll('systemDesign');
};

export const bulkSetSystemDesignProgress = async (entries: Record<string, SystemDesignProgress>) => {
  const db = await openDatabase();
  const tx = db.transaction('systemDesign', 'readwrite');
  await Promise.all(Object.entries(entries).map(([id, progress]) => tx.store.put(progress, id)));
  await tx.done;
};
