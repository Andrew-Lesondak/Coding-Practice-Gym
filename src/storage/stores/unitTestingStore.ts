import { openDatabase } from '../db';
import { UnitTestingProgress } from '../../types/unitTesting';

export const getUnitTestingProgressEntry = async (problemId: string) => {
  const db = await openDatabase();
  return (await db.get('unitTesting', problemId)) ?? null;
};

export const setUnitTestingProgressEntry = async (
  problemId: string,
  progress: UnitTestingProgress
) => {
  const db = await openDatabase();
  await db.put('unitTesting', progress, problemId);
};
