import { ProblemProgress } from '../types/progress';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const updateSchedule = (
  progress: ProblemProgress,
  difficulty: number,
  confidence: number
): ProblemProgress => {
  const rating = clamp(Math.round((difficulty + (6 - confidence)) / 2), 1, 5);
  const easeDelta = 0.1 - (5 - rating) * 0.08;
  const easeFactor = clamp(progress.easeFactor + easeDelta, 1.3, 2.8);
  const intervalBase = progress.reviewIntervalDays || 2;
  const interval = clamp(Math.round(intervalBase * easeFactor), 1, 60);
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    ...progress,
    reviewIntervalDays: interval,
    easeFactor,
    nextReviewAt: nextReviewAt.toISOString(),
    lastRating: {
      difficulty,
      confidence
    }
  };
};
