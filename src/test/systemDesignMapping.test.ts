import { getSuggestedStepForCategory, getSuggestedStepForItem, getSuggestedStepForDecision } from '../lib/systemDesignMapping';

describe('system design mapping', () => {
  it('maps categories to steps', () => {
    expect(getSuggestedStepForCategory('requirements')).toBe(1);
    expect(getSuggestedStepForCategory('security')).toBe(10);
  });

  it('maps item ids to steps', () => {
    expect(getSuggestedStepForItem('cache-policy', 'architecture')).toBe(5);
  });

  it('maps decisions to steps', () => {
    expect(getSuggestedStepForDecision('Use cache for reads')).toBe(5);
    expect(getSuggestedStepForDecision('Sharding by userId')).toBe(7);
  });
});
