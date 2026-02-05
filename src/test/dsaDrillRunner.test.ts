import { getDrillTests } from '../lib/dsaDrillRunner';
import { problems } from '../data/problems';
import { dsaDrills } from '../data/dsaDrills';

describe('DSA drill test selection', () => {
  it('returns visible tests only', () => {
    const drill = dsaDrills.find((d) => d.visibleTestsOnly)!;
    const problem = problems.find((p) => p.id === drill.problemId)!;
    const tests = getDrillTests(problem, drill);
    expect(tests).toHaveLength(problem.tests.visible.length);
  });
});
