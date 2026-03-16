import { openDatabase } from '../db';
import { ReactDebuggingProgress } from '../../types/reactDebugging';

export const getReactDebuggingProgressEntry = async (problemId: string) => {
  const db = await openDatabase();
  return (await db.get('reactDebugging', problemId)) ?? null;
};

export const setReactDebuggingProgressEntry = async (
  problemId: string,
  progress: ReactDebuggingProgress
) => {
  const db = await openDatabase();
  await db.put('reactDebugging', progress, problemId);
};
