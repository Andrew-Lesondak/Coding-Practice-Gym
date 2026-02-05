import { parseDesignSteps } from '../lib/systemDesignStub';
import { systemDesignDrills } from '../data/systemDesignDrills';

describe('drill step parsing', () => {
  it('parses steps from starter templates', () => {
    const drill = systemDesignDrills[0];
    const steps = parseDesignSteps(drill.starterTemplateMarkdown);
    expect(steps.length).toBeGreaterThan(0);
  });
});
