import { useMemo } from 'react';
import { quizQuestions as baseQuestions } from '../data/quizzes';
import { mergeQuizPacks, normalizeOverlayPack } from './problemPack';
import { useAppStore } from '../store/useAppStore';

export const useQuizQuestions = () => {
  const overlayEnabled = useAppStore((state) => state.settings.overlayEnabled);
  const overlayPack = useAppStore((state) => state.overlayPack);

  return useMemo(() => {
    if (!overlayEnabled) return baseQuestions;
    const overlay = normalizeOverlayPack(overlayPack);
    return mergeQuizPacks(baseQuestions, overlay?.quizQuestions);
  }, [overlayEnabled, overlayPack]);
};
