import { useMemo } from 'react';
import { dataStructureProblems as baseProblems } from '../data/dataStructureProblems';
import { mergeDataStructurePacks, normalizeOverlayPack } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useDataStructureProblems = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);

  return useMemo(() => {
    if (!overlayEnabled) return baseProblems;
    const overlay = normalizeOverlayPack(overlayPack);
    return mergeDataStructurePacks(baseProblems, overlay?.dataStructureProblems);
  }, [overlayEnabled, overlayPack]);
};
