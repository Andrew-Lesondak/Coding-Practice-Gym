import { systemDesignDrills } from '../data/systemDesignDrills';
import { systemDesignPrompts } from '../data/systemDesignPrompts';

describe('drill linking', () => {
  it('links to existing prompts when relatedPromptId is set', () => {
    const promptIds = new Set(systemDesignPrompts.map((p) => p.id));
    const linked = systemDesignDrills.filter((drill) => drill.relatedPromptId);
    expect(linked.length).toBeGreaterThan(0);
    linked.forEach((drill) => {
      expect(promptIds.has(drill.relatedPromptId as string)).toBe(true);
    });
  });
});
