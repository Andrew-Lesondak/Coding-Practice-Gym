import { useMemo } from 'react';
import { systemDesignPrompts as basePrompts } from '../data/systemDesignPrompts';
import { mergeSystemDesignPacks, normalizeOverlayPack } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useSystemDesignPrompts = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);

  return useMemo(() => {
    if (!overlayEnabled) return basePrompts;
    const overlay = normalizeOverlayPack(overlayPack);
    return mergeSystemDesignPacks(basePrompts, overlay?.systemDesignPrompts);
  }, [overlayEnabled, overlayPack]);
};
