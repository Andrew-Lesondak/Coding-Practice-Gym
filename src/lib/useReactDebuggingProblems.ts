import { reactDebuggingProblems } from '../data/reactDebuggingProblems';
import { mergeReactDebuggingPacks, normalizeOverlayPack } from './problemPack';
import { ReactDebuggingProblem } from '../types/reactDebugging';
import { useAppStore } from '../store/useAppStore';

export const useReactDebuggingProblems = (): ReactDebuggingProblem[] => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);
  const overlay = overlayEnabled ? normalizeOverlayPack(overlayPack)?.reactDebuggingProblems : undefined;
  return mergeReactDebuggingPacks(reactDebuggingProblems, overlay);
};
