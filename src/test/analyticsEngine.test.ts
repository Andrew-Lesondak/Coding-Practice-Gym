import { generateInsights } from '../lib/analytics/engine';

describe('analytics insights', () => {
  it('flags speed vs accuracy drop', () => {
    const dsaStats = [
      { id: 'two-sum', patterns: ['Arrays/Hashing'], attempts: 4, passes: 4, score: 1, confidence: 3 }
    ];
    const drillStats = [
      { drillId: 'core-loop-two-sum', problemId: 'two-sum', drillType: 'core-loop', difficulty: 'easy', patterns: ['Arrays/Hashing'], completedAt: 'now', durationSeconds: 200, passed: true, confidence: 3 },
      { drillId: 'core-loop-two-sum', problemId: 'two-sum', drillType: 'core-loop', difficulty: 'easy', patterns: ['Arrays/Hashing'], completedAt: 'now', durationSeconds: 200, passed: false, confidence: 3 }
    ];
    const insights = generateInsights(dsaStats as any, drillStats as any, [] as any, [] as any);
    expect(insights.some((i) => i.id.includes('speed'))).toBe(true);
  });

  it('flags confidence mismatch', () => {
    const dsaStats = [
      { id: 'two-sum', patterns: ['Arrays/Hashing'], attempts: 4, passes: 1, score: 0.25, confidence: 5 }
    ];
    const insights = generateInsights(dsaStats as any, [] as any, [] as any, [] as any);
    expect(insights.some((i) => i.id.includes('overconfidence'))).toBe(true);
  });
});
