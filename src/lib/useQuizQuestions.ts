import { useMemo } from 'react';
import { quizQuestions as baseQuestions } from '../data/quizzes';
import { loadOverlayPack, mergeQuizPacks } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useQuizQuestions = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayVersion = useAppStore((state) => state.overlayVersion);

  return useMemo(() => {
    if (!overlayEnabled) return baseQuestions;
    const overlay = loadOverlayPack();
    return mergeQuizPacks(baseQuestions, overlay?.quizQuestions);
  }, [overlayEnabled, overlayVersion]);
};
