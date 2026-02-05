import { createMockSession, advancePhase, selectDrillsForPrompt } from '../lib/mockInterview';
import { systemDesignDrills } from '../data/systemDesignDrills';

describe('mock interview logic', () => {
  it('selects drills for prompt', () => {
    const selected = selectDrillsForPrompt(systemDesignDrills, 'url-shortener', 'easy');
    expect(selected.requirementsDrillId).toBeDefined();
  });

  it('advances phases', () => {
    const session = createMockSession('url-shortener', systemDesignDrills, 'easy');
    const next = advancePhase(session);
    expect(next.phaseIndex).toBe(1);
  });
});
