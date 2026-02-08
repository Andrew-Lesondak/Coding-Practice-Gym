import { useMemo } from 'react';
import { systemDesignDrills as baseDrills } from '../data/systemDesignDrills';
import { normalizeOverlayPack } from './problemPack';
import { useAppStore } from '../store/useAppStore';
import { SystemDesignDrill } from '../types/systemDesignDrill';

const mergeDrills = (base: SystemDesignDrill[], overlay?: SystemDesignDrill[]) => {
  if (!overlay || overlay.length === 0) return base;
  const map = new Map<string, SystemDesignDrill>();
  base.forEach((drill) => map.set(drill.id, drill));
  overlay.forEach((drill) => map.set(drill.id, drill));
  return Array.from(map.values());
};

export const useSystemDesignDrills = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);

  return useMemo(() => {
    if (!overlayEnabled) return baseDrills;
    const overlay = normalizeOverlayPack(overlayPack);
    return mergeDrills(baseDrills, overlay?.systemDesignDrills);
  }, [overlayEnabled, overlayPack]);
};
