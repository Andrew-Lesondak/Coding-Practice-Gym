import { openDatabase } from '../db';
import { SystemDesignDrillProgress } from '../../types/progress';

export const getSystemDesignDrillProgressEntry = async (drillId: string) => {
  const db = await openDatabase();
  return (await db.get('systemDesignDrills', drillId)) ?? null;
};

export const setSystemDesignDrillProgressEntry = async (drillId: string, progress: SystemDesignDrillProgress) => {
  const db = await openDatabase();
  await db.put('systemDesignDrills', progress, drillId);
};

export const getAllSystemDesignDrillProgress = async () => {
  const db = await openDatabase();
  return await db.getAll('systemDesignDrills');
};

export const bulkSetSystemDesignDrillProgress = async (entries: Record<string, SystemDesignDrillProgress>) => {
  const db = await openDatabase();
  const tx = db.transaction('systemDesignDrills', 'readwrite');
  await Promise.all(Object.entries(entries).map(([id, progress]) => tx.store.put(progress, id)));
  await tx.done;
};
