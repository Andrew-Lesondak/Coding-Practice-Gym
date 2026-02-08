import { AdaptiveSessionPlan, AdaptiveSessionRun } from '../types/adaptive';
import { useAppStore } from '../store/useAppStore';

export const loadAdaptivePlans = (): AdaptiveSessionPlan[] => {
  return useAppStore.getState().adaptivePlans;
};

export const saveAdaptivePlan = (plan: AdaptiveSessionPlan) => {
  useAppStore.getState().addAdaptivePlan(plan);
};

export const getAdaptivePlan = (id: string) => loadAdaptivePlans().find((plan) => plan.id === id) ?? null;

export const loadAdaptiveRuns = (): AdaptiveSessionRun[] => {
  return useAppStore.getState().adaptiveRuns;
};

export const saveAdaptiveRun = (run: AdaptiveSessionRun) => {
  useAppStore.getState().addAdaptiveRun(run);
};

export const getAdaptiveRun = (id: string) => loadAdaptiveRuns().find((run) => run.sessionId === id) ?? null;
