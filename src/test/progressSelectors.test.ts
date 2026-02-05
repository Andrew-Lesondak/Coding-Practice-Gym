import { getStats } from '../lib/progressSelectors';
import { problems } from '../data/problems';
import { ProgressState } from '../types/progress';

describe('progress selectors', () => {
  it('computes stats with completed problems', () => {
    const state: ProgressState = {
      problems: {
        [problems[0].id]: {
          attempts: 2,
          passes: 1,
          stepCompletion: {},
          reviewIntervalDays: 2,
          easeFactor: 2.3,
          explanationHistory: []
        }
      },
      systemDesign: {},
      systemDesignDrills: {}
    };

    const stats = getStats(problems, state);
    expect(stats.completed).toBe(1);
    expect(stats.started).toBe(1);
    expect(stats.attempts).toBe(2);
  });
});
