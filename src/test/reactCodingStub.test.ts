import { describe, it, expect } from 'vitest';
import { reactCodingProblems } from '../data/reactCodingProblems';
import { parseSteps, parseTodoRegions } from '../lib/guidedStub';

describe('react coding stub parsing', () => {
  it('parses steps and TODO regions from guided stub', () => {
    const stub = reactCodingProblems[0].guidedStubTsx;
    const steps = parseSteps(stub);
    const regions = parseTodoRegions(stub);
    expect(steps.length).toBeGreaterThan(0);
    expect(regions.length).toBeGreaterThan(0);
  });
});
