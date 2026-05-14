import { openDatabase } from '../db';
import { DataStructureProgress } from '../../types/dataStructures';

export const getDataStructureProgressEntry = async (problemId: string) => {
  const db = await openDatabase();
  return (await db.get('dataStructures', problemId)) ?? null;
};

export const setDataStructureProgressEntry = async (
  problemId: string,
  progress: DataStructureProgress
) => {
  const db = await openDatabase();
  await db.put('dataStructures', progress, problemId);
};
