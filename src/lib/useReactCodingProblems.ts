import { reactCodingProblems } from '../data/reactCodingProblems';
import { loadOverlayPack, getOverlayEnabled, mergeReactCodingPacks } from './problemPack';
import { ReactCodingProblem } from '../types/reactCoding';
import { useAppStore } from '../store/useAppStore';

export const useReactCodingProblems = (): ReactCodingProblem[] => {
  const overlayVersion = useAppStore((state) => state.overlayVersion);
  const overlayEnabled = getOverlayEnabled();
  const overlay = overlayEnabled ? loadOverlayPack()?.reactCodingProblems : undefined;
  void overlayVersion;
  return mergeReactCodingPacks(reactCodingProblems, overlay);
};
