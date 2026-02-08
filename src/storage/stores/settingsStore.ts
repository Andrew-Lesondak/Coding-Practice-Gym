import { SettingsState } from '../../types/progress';
import { openDatabase } from '../db';

const SETTINGS_KEY = 'settings';

export const getSettings = async () => {
  const db = await openDatabase();
  return (await db.get('settings', SETTINGS_KEY)) ?? null;
};

export const setSettings = async (settings: SettingsState) => {
  const db = await openDatabase();
  await db.put('settings', settings, SETTINGS_KEY);
};
