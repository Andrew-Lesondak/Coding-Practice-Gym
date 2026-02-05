import { useMemo } from 'react';
import { systemDesignPrompts as basePrompts } from '../data/systemDesignPrompts';
import { loadOverlayPack, mergeSystemDesignPacks } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useSystemDesignPrompts = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayVersion = useAppStore((state) => state.overlayVersion);

  return useMemo(() => {
    if (!overlayEnabled) return basePrompts;
    const overlay = loadOverlayPack();
    return mergeSystemDesignPacks(basePrompts, overlay?.systemDesignPrompts);
  }, [overlayEnabled, overlayVersion]);
};
