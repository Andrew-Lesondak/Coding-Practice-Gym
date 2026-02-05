import { updateSchedule } from '../lib/spacedRepetition';
import { ProblemProgress } from '../types/progress';

describe('spaced repetition', () => {
  it('updates next review date and ease factor', () => {
    const progress: ProblemProgress = {
      attempts: 1,
      passes: 1,
      stepCompletion: {},
      reviewIntervalDays: 2,
      easeFactor: 2.3
    };

    const updated = updateSchedule(progress, 2, 4);
    expect(updated.easeFactor).toBeGreaterThan(1.3);
    expect(updated.nextReviewAt).toBeDefined();
    expect(updated.reviewIntervalDays).toBeGreaterThanOrEqual(1);
  });
});
