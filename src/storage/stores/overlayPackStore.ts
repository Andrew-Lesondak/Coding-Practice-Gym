import { openDatabase } from '../db';
import { OverlayPack } from '../../lib/problemPack';

const OVERLAY_KEY = 'overlay';

export const getOverlayPack = async () => {
  const db = await openDatabase();
  return (await db.get('overlayPack', OVERLAY_KEY)) ?? null;
};

export const setOverlayPack = async (pack: OverlayPack) => {
  const db = await openDatabase();
  await db.put('overlayPack', pack, OVERLAY_KEY);
};

export const clearOverlayPack = async () => {
  const db = await openDatabase();
  await db.delete('overlayPack', OVERLAY_KEY);
};
