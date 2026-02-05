import { DSASpeedDrill } from '../types/dsaDrill';

export type DrillAttempt = {
  drillId: string;
  problemId: string;
  drillType: DSASpeedDrill['drillType'];
  difficulty: DSASpeedDrill['difficulty'];
  completedAt: string;
  durationSeconds: number;
  passed: boolean;
  confidence: number;
};

const KEY = 'dsa-speed-drill-attempts';

export const loadDrillAttempts = (): DrillAttempt[] => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DrillAttempt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveDrillAttempt = (attempt: DrillAttempt) => {
  const all = loadDrillAttempts();
  all.push(attempt);
  localStorage.setItem(KEY, JSON.stringify(all));
};

export const getDrillStats = (drillId: string) => {
  const attempts = loadDrillAttempts().filter((attempt) => attempt.drillId === drillId);
  if (attempts.length === 0) {
    return { attempts: 0, passRate: 0, avgDuration: 0, confidenceAvg: 0 };
  }
  const passRate = attempts.filter((a) => a.passed).length / attempts.length;
  const avgDuration = attempts.reduce((sum, a) => sum + a.durationSeconds, 0) / attempts.length;
  const confidenceAvg = attempts.reduce((sum, a) => sum + a.confidence, 0) / attempts.length;
  return { attempts: attempts.length, passRate, avgDuration, confidenceAvg };
};
