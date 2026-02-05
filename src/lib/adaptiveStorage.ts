import { AdaptiveSessionPlan, AdaptiveSessionRun } from '../types/adaptive';

const PLAN_KEY = 'dsa-gym-adaptive-plans';
const RUN_KEY = 'dsa-gym-adaptive-runs';

export const loadAdaptivePlans = (): AdaptiveSessionPlan[] => {
  const raw = localStorage.getItem(PLAN_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdaptiveSessionPlan[];
  } catch {
    return [];
  }
};

export const saveAdaptivePlan = (plan: AdaptiveSessionPlan) => {
  const all = loadAdaptivePlans().filter((item) => item.id !== plan.id);
  localStorage.setItem(PLAN_KEY, JSON.stringify([plan, ...all]));
};

export const getAdaptivePlan = (id: string) => loadAdaptivePlans().find((plan) => plan.id === id) ?? null;

export const loadAdaptiveRuns = (): AdaptiveSessionRun[] => {
  const raw = localStorage.getItem(RUN_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AdaptiveSessionRun[];
  } catch {
    return [];
  }
};

export const saveAdaptiveRun = (run: AdaptiveSessionRun) => {
  const all = loadAdaptiveRuns().filter((item) => item.sessionId !== run.sessionId);
  localStorage.setItem(RUN_KEY, JSON.stringify([run, ...all]));
};

export const getAdaptiveRun = (id: string) => loadAdaptiveRuns().find((run) => run.sessionId === id) ?? null;
