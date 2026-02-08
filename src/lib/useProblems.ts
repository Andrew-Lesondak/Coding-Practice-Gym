import { useMemo } from 'react';
import { problems as baseProblems } from '../data/problems';
import { mergePacks, normalizeOverlayPack } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useProblems = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);

  return useMemo(() => {
    if (!overlayEnabled) return baseProblems;
    const overlay = normalizeOverlayPack(overlayPack);
    return mergePacks(baseProblems, overlay?.problems);
  }, [overlayEnabled, overlayPack]);
};
