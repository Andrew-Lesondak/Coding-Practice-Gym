import { useMemo } from 'react';
import { mergeUnitTestingPacks, normalizeOverlayPack } from './problemPack';
import { UnitTestingProblem } from '../types/unitTesting';
import { unitTestingProblems } from '../data/unitTestingProblems';
import { useAppStore } from '../store/useAppStore';

export const useUnitTestingProblems = (): UnitTestingProblem[] => {
  const overlayPack = useAppStore((state) => state.overlayPack);
  const overlay = normalizeOverlayPack(overlayPack)?.unitTestingProblems;
  return useMemo(() => mergeUnitTestingPacks(unitTestingProblems, overlay), [overlay]);
};
