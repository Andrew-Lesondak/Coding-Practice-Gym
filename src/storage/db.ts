import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { ProblemProgress, SystemDesignProgress, SystemDesignDrillProgress, SettingsState } from '../types/progress';
import { QuizProgress, QuizSession } from '../types/quiz';
import { DrillAttempt } from '../lib/dsaDrillStorage';
import { SystemDesignMockSession } from '../types/systemDesignMock';
import { AdaptiveSessionPlan, AdaptiveSessionRun } from '../types/adaptive';
import { OverlayPack } from '../lib/problemPack';
import { ReactCodingProgress } from '../types/reactCoding';

export const DB_NAME = 'coding-practice-gym-db';
export const DATABASE_VERSION = 2;

export type EditorDraftRecord = {
  id: string;
  value: string;
  updatedAt: string;
};

export type AdaptiveRecord = {
  id: string;
  kind: 'plan' | 'run';
  data: AdaptiveSessionPlan | AdaptiveSessionRun;
};

export type MetaRecord = {
  key: string;
  value: string;
};

export interface CodingPracticeGymDb extends DBSchema {
  meta: {
    key: string;
    value: MetaRecord;
  };
  settings: {
    key: string;
    value: SettingsState;
  };
  overlayPack: {
    key: string;
    value: OverlayPack;
  };
  dsaProgress: {
    key: string;
    value: ProblemProgress;
  };
  systemDesign: {
    key: string;
    value: SystemDesignProgress;
  };
  systemDesignDrills: {
    key: string;
    value: SystemDesignDrillProgress;
  };
  quizzes: {
    key: string;
    value: QuizProgress;
  };
  reactCoding: {
    key: string;
    value: ReactCodingProgress;
  };
  dsaDrillAttempts: {
    key: string;
    value: DrillAttempt;
  };
  mockSessions: {
    key: string;
    value: SystemDesignMockSession;
  };
  quizSessions: {
    key: string;
    value: QuizSession;
  };
  adaptiveSessions: {
    key: string;
    value: AdaptiveRecord;
  };
  analytics: {
    key: string;
    value: Record<string, unknown>;
  };
  editorDrafts: {
    key: string;
    value: EditorDraftRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<CodingPracticeGymDb>> | null = null;

export const openDatabase = () => {
  if (!dbPromise) {
    dbPromise = openDB<CodingPracticeGymDb>(DB_NAME, DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
        if (!db.objectStoreNames.contains('overlayPack')) db.createObjectStore('overlayPack');
        if (!db.objectStoreNames.contains('dsaProgress')) db.createObjectStore('dsaProgress');
        if (!db.objectStoreNames.contains('systemDesign')) db.createObjectStore('systemDesign');
        if (!db.objectStoreNames.contains('systemDesignDrills')) db.createObjectStore('systemDesignDrills');
        if (!db.objectStoreNames.contains('quizzes')) db.createObjectStore('quizzes');
        if (!db.objectStoreNames.contains('reactCoding')) db.createObjectStore('reactCoding');
        if (!db.objectStoreNames.contains('dsaDrillAttempts')) db.createObjectStore('dsaDrillAttempts');
        if (!db.objectStoreNames.contains('mockSessions')) db.createObjectStore('mockSessions');
        if (!db.objectStoreNames.contains('quizSessions')) db.createObjectStore('quizSessions');
        if (!db.objectStoreNames.contains('adaptiveSessions')) db.createObjectStore('adaptiveSessions');
        if (!db.objectStoreNames.contains('analytics')) db.createObjectStore('analytics');
        if (!db.objectStoreNames.contains('editorDrafts')) db.createObjectStore('editorDrafts');
      }
    });
  }
  return dbPromise;
};

export const resetDatabase = async () => {
  dbPromise = null;
  try {
    indexedDB.deleteDatabase(DB_NAME);
  } catch {
    // ignore delete failures
  }
  await Promise.resolve();
};

export const resetDatabaseHard = async () => {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch {
      // ignore close failures
    }
  }
  dbPromise = null;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    const finalize = () => resolve();
    req.onsuccess = finalize;
    req.onerror = finalize;
    req.onblocked = finalize;
    setTimeout(finalize, 100);
  });
};
