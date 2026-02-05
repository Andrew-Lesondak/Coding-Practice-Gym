import { generateInsights } from '../lib/analytics/engine';

const dsaStats = [
  { id: 'two-sum', patterns: ['Arrays/Hashing'], attempts: 4, passes: 4, score: 1, confidence: 4 }
];
const drillStats = [
  { drillId: 'core-loop-two-sum', problemId: 'two-sum', drillType: 'core-loop', difficulty: 'easy', patterns: ['Arrays/Hashing'], completedAt: 'now', durationSeconds: 200, passed: false, confidence: 2 }
];
const sdDrillStats = [
  { drillId: 'reliability-notifications', score: 0.3, lastAttemptedAt: 'now', confidence: 2, rubricCategories: ['reliability'] }
];
const mockStats = [
  { sessionId: 'mock1', promptId: 'url-shortener', completedAt: 1, phaseScores: { requirements: 0.2 }, phaseDurations: {}, confidence: 5 }
];

describe('analytics insights', () => {
  it('flags speed vs accuracy drop', () => {
    const insights = generateInsights(dsaStats as any, drillStats as any, sdDrillStats as any, mockStats as any);
    expect(insights.some((i) => i.id.includes('speed'))).toBe(true);
  });

  it('flags confidence mismatch', () => {
    const insights = generateInsights(dsaStats as any, drillStats as any, sdDrillStats as any, mockStats as any);
    expect(insights.some((i) => i.id.includes('overconfidence'))).toBe(true);
  });
});
