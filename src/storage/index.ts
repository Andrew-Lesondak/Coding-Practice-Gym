import { openDatabase } from './db';
import { getMeta, setMeta } from './stores/metaStore';
import { extractLegacyState, migrateFromLocalStorage } from './migrations/v1_from_localStorage';
import { getOverlayPack } from './stores/overlayPackStore';
import { getSettings } from './stores/settingsStore';
import { getDrillAttempts } from './stores/dsaDrillsStore';
import { getMockSessions } from './stores/mockInterviewStore';
import { getQuizSessions } from './stores/quizSessionStore';
import { getAdaptivePlans, getAdaptiveRuns } from './stores/adaptiveSessionStore';

export const MIGRATION_FLAG = 'migration_v2_complete';
export type StorageInitStatus = 'ready' | 'unavailable' | 'error' | 'migrating';

const isDbEmpty = async () => {
  const db = await openDatabase();
  const counts = await Promise.all([
    db.count('dsaProgress'),
    db.count('systemDesign'),
    db.count('systemDesignDrills'),
    db.count('quizzes'),
    db.count('reactCoding'),
    db.count('dsaDrillAttempts'),
    db.count('mockSessions'),
    db.count('quizSessions'),
    db.count('adaptiveSessions'),
    db.count('overlayPack')
  ]);
  return counts.every((count) => count === 0);
};

export const initializeStorage = async (): Promise<StorageInitStatus> => {
  try {
    await openDatabase();
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('IndexedDB unavailable:', error);
    }
    return 'unavailable';
  }

  const migrationMeta = await getMeta(MIGRATION_FLAG);
  const hasLegacy =
    Boolean(localStorage.getItem('coding-practice-gym-store')) ||
    Boolean(localStorage.getItem('coding-practice-gym-overlay-pack')) ||
    Boolean(localStorage.getItem('dsa-speed-drill-attempts'));

  if (!migrationMeta && hasLegacy) {
    const empty = await isDbEmpty();
    if (empty) {
      try {
        await migrateFromLocalStorage();
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('Migration failed:', error);
        }
      }
    }
  }

  await setMeta(MIGRATION_FLAG, 'true');
  return 'ready';
};

export const loadLegacyState = () => {
  const legacy = extractLegacyState();
  return {
    progress: legacy.progress ?? null,
    settings: legacy.settings,
    overlayPack: legacy.overlay,
    drillAttempts: legacy.drillAttempts,
    mockSessions: legacy.mockSessions,
    quizSessions: legacy.quizSessions,
    adaptivePlans: legacy.adaptivePlans,
    adaptiveRuns: legacy.adaptiveRuns,
    drafts: legacy.drafts
  };
};

export const loadAllState = async () => {
  const db = await openDatabase();
  const [
    problemKeys,
    problemValues,
    systemKeys,
    systemValues,
    drillKeys,
    drillValues,
    quizKeys,
    quizValues,
    reactKeys,
    reactValues
  ] = await Promise.all([
    db.getAllKeys('dsaProgress'),
    db.getAll('dsaProgress'),
    db.getAllKeys('systemDesign'),
    db.getAll('systemDesign'),
    db.getAllKeys('systemDesignDrills'),
    db.getAll('systemDesignDrills'),
    db.getAllKeys('quizzes'),
    db.getAll('quizzes'),
    db.getAllKeys('reactCoding'),
    db.getAll('reactCoding')
  ]);

  const settings = (await getSettings()) ?? null;
  const overlayPack = await getOverlayPack();
  const drillAttempts = await getDrillAttempts();
  const mockSessions = await getMockSessions();
  const quizSessions = await getQuizSessions();
  const adaptivePlans = await getAdaptivePlans();
  const adaptiveRuns = await getAdaptiveRuns();

  const toRecord = <T>(keys: IDBValidKey[], values: T[]) =>
    Object.fromEntries(keys.map((key, index) => [String(key), values[index]])) as Record<string, T>;

  return {
    progress: {
      problems: toRecord(problemKeys, problemValues),
      systemDesign: toRecord(systemKeys, systemValues),
      systemDesignDrills: toRecord(drillKeys, drillValues),
      quizzes: toRecord(quizKeys, quizValues),
      reactCoding: toRecord(reactKeys, reactValues)
    },
    settings,
    overlayPack,
    drillAttempts,
    mockSessions,
    quizSessions,
    adaptivePlans,
    adaptiveRuns
  };
};
