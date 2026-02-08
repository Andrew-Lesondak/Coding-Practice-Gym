import { openDatabase, EditorDraftRecord } from '../db';

export const getDraft = async (id: string) => {
  try {
    const db = await openDatabase();
    return (await db.get('editorDrafts', id)) ?? null;
  } catch {
    const fallback = localStorage.getItem(id);
    return fallback ? { id, value: fallback, updatedAt: new Date().toISOString() } : null;
  }
};

export const setDraft = async (id: string, value: string) => {
  try {
    const db = await openDatabase();
    const record: EditorDraftRecord = { id, value, updatedAt: new Date().toISOString() };
    await db.put('editorDrafts', record, id);
  } catch {
    // IndexedDB unavailable: no-op for read-only fallback.
  }
};

export const bulkSetDrafts = async (entries: Record<string, string>) => {
  const db = await openDatabase();
  const tx = db.transaction('editorDrafts', 'readwrite');
  const now = new Date().toISOString();
  await Promise.all(
    Object.entries(entries).map(([id, value]) => tx.store.put({ id, value, updatedAt: now }, id))
  );
  await tx.done;
};
