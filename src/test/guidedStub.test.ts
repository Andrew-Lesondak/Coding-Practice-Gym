import { computeStepCompletion, parseSteps } from '../lib/guidedStub';

describe('guided stub helpers', () => {
  const stub = `function demo() {\n  // Step 1: Do thing\n  // TODO(step 1 start)\n  // placeholder\n  // TODO(step 1 end)\n\n  // Step 2: Do next\n  // TODO(step 2 start)\n  // placeholder\n  // TODO(step 2 end)\n}`;

  it('parses steps in order', () => {
    const steps = parseSteps(stub);
    expect(steps.length).toBe(2);
    expect(steps[0].index).toBe(1);
    expect(steps[1].index).toBe(2);
  });

  it('detects completion when placeholder changes', () => {
    const edited = stub.replace('// placeholder', '// real code');
    const completion = computeStepCompletion(edited, stub);
    expect(completion[1]).toBe(true);
    expect(completion[2]).toBe(false);
  });
});
