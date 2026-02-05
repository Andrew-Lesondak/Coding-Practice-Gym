import { useMemo } from 'react';
import { systemDesignDrills as baseDrills } from '../data/systemDesignDrills';
import { loadOverlayPack } from './problemPack';
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
  const overlayVersion = useAppStore((state) => state.overlayVersion);

  return useMemo(() => {
    if (!overlayEnabled) return baseDrills;
    const overlay = loadOverlayPack();
    return mergeDrills(baseDrills, overlay?.systemDesignDrills);
  }, [overlayEnabled, overlayVersion]);
};
