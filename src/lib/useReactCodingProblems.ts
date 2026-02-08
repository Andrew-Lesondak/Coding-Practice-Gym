import { reactCodingProblems } from '../data/reactCodingProblems';
import { mergeReactCodingPacks, normalizeOverlayPack } from './problemPack';
import { ReactCodingProblem } from '../types/reactCoding';
import { useAppStore } from '../store/useAppStore';

export const useReactCodingProblems = (): ReactCodingProblem[] => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);
  const overlay = overlayEnabled ? normalizeOverlayPack(overlayPack)?.reactCodingProblems : undefined;
  return mergeReactCodingPacks(reactCodingProblems, overlay);
};
