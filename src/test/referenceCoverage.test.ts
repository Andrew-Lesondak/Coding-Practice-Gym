import { isDecisionMentioned } from '../lib/referenceCoverage';

const decision = {
  decision: 'Use Redis cache',
  why: 'Reduce latency',
  alternatives: ['Memcached']
};

describe('reference coverage', () => {
  it('detects mention case-insensitively', () => {
    const text = 'We should use redis for caching.';
    expect(isDecisionMentioned(decision as any, text)).toBe(true);
  });

  it('returns false when not mentioned', () => {
    const text = 'Use a database only.';
    expect(isDecisionMentioned(decision as any, text)).toBe(false);
  });
});
