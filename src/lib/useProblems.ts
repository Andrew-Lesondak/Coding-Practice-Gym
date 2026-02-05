import { useMemo } from 'react';
import { problems as baseProblems } from '../data/problems';
import { loadOverlayPack, mergePacks } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useProblems = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayVersion = useAppStore((state) => state.overlayVersion);

  return useMemo(() => {
    if (!overlayEnabled) return baseProblems;
    const overlay = loadOverlayPack();
    return mergePacks(baseProblems, overlay?.problems);
  }, [overlayEnabled, overlayVersion]);
};
