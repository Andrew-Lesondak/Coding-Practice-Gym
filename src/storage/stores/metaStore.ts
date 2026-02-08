import { openDatabase, MetaRecord } from '../db';

export const getMeta = async (key: string) => {
  const db = await openDatabase();
  return (await db.get('meta', key)) ?? null;
};

export const setMeta = async (key: string, value: string) => {
  const db = await openDatabase();
  const record: MetaRecord = { key, value };
  await db.put('meta', record);
};

export const clearMeta = async () => {
  const db = await openDatabase();
  await db.clear('meta');
};
