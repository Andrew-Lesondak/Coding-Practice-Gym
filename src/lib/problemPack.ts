import { Problem, ProblemPack } from '../types/problem';
import { SystemDesignPrompt } from '../types/systemDesign';
import { SystemDesignDrill } from '../types/systemDesignDrill';

const OVERLAY_KEY = 'dsa-gym-overlay-pack';
const OVERLAY_ENABLED_KEY = 'dsa-gym-overlay-enabled';

export type OverlayPack = ProblemPack & { systemDesignPrompts?: SystemDesignPrompt[]; systemDesignDrills?: SystemDesignDrill[] };

export const loadOverlayPack = (): OverlayPack | null => {
  const raw = localStorage.getItem(OVERLAY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OverlayPack;
    if (!parsed || !Array.isArray(parsed.problems)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveOverlayPack = (pack: OverlayPack) => {
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(pack));
};

export const clearOverlayPack = () => {
  localStorage.removeItem(OVERLAY_KEY);
};

export const getOverlayEnabled = () => {
  return localStorage.getItem(OVERLAY_ENABLED_KEY) === 'true';
};

export const setOverlayEnabled = (enabled: boolean) => {
  localStorage.setItem(OVERLAY_ENABLED_KEY, String(enabled));
};

export const mergePacks = (base: Problem[], overlay?: Problem[]): Problem[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, Problem>();
  base.forEach((problem) => map.set(problem.id, problem));
  overlay.forEach((problem) => map.set(problem.id, problem));
  return Array.from(map.values());
};

export const mergeSystemDesignPacks = (
  base: SystemDesignPrompt[],
  overlay?: SystemDesignPrompt[]
): SystemDesignPrompt[] => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, SystemDesignPrompt>();
  base.forEach((prompt) => map.set(prompt.id, prompt));
  overlay.forEach((prompt) => map.set(prompt.id, prompt));
  return Array.from(map.values());
};
