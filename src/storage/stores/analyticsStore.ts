import { openDatabase } from '../db';

const ANALYTICS_KEY = 'analytics';

export const getAnalyticsSnapshot = async () => {
  const db = await openDatabase();
  return (await db.get('analytics', ANALYTICS_KEY)) ?? null;
};

export const setAnalyticsSnapshot = async (snapshot: Record<string, unknown>) => {
  const db = await openDatabase();
  await db.put('analytics', snapshot, ANALYTICS_KEY);
};
