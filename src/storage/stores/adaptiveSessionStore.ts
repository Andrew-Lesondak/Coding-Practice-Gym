import { openDatabase, AdaptiveRecord } from '../db';
import { AdaptiveSessionPlan, AdaptiveSessionRun } from '../../types/adaptive';

export const getAdaptivePlans = async () => {
  const db = await openDatabase();
  const all = await db.getAll('adaptiveSessions');
  return all.filter((record) => record.kind === 'plan').map((record) => record.data as AdaptiveSessionPlan);
};

export const getAdaptiveRuns = async () => {
  const db = await openDatabase();
  const all = await db.getAll('adaptiveSessions');
  return all.filter((record) => record.kind === 'run').map((record) => record.data as AdaptiveSessionRun);
};

export const saveAdaptivePlan = async (plan: AdaptiveSessionPlan) => {
  const db = await openDatabase();
  const record: AdaptiveRecord = { id: plan.id, kind: 'plan', data: plan };
  await db.put('adaptiveSessions', record, record.id);
};

export const saveAdaptiveRun = async (run: AdaptiveSessionRun) => {
  const db = await openDatabase();
  const record: AdaptiveRecord = { id: run.sessionId, kind: 'run', data: run };
  await db.put('adaptiveSessions', record, record.id);
};

export const bulkSaveAdaptivePlans = async (plans: AdaptiveSessionPlan[]) => {
  const db = await openDatabase();
  const tx = db.transaction('adaptiveSessions', 'readwrite');
  await Promise.all(
    plans.map((plan) =>
      tx.store.put({ id: plan.id, kind: 'plan', data: plan }, plan.id)
    )
  );
  await tx.done;
};

export const bulkSaveAdaptiveRuns = async (runs: AdaptiveSessionRun[]) => {
  const db = await openDatabase();
  const tx = db.transaction('adaptiveSessions', 'readwrite');
  await Promise.all(
    runs.map((run) =>
      tx.store.put({ id: run.sessionId, kind: 'run', data: run }, run.sessionId)
    )
  );
  await tx.done;
};
