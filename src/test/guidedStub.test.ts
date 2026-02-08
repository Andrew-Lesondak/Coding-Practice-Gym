import { computeStepCompletion, parseSteps } from '../lib/guidedStub';

describe('guided stub helpers', () => {
  const stub = `function demo() {\n  // Step 1: Do thing\n  // TODO(step 1 start)\n  // placeholder\n  // TODO(step 1 end)\n\n  // Step 1.1: Inner loop\n  // TODO(step 1.1 start)\n  // placeholder\n  // TODO(step 1.1 end)\n\n  // Step 2: Do next\n  // TODO(step 2 start)\n  // placeholder\n  // TODO(step 2 end)\n}`;

  it('parses steps in order', () => {
    const steps = parseSteps(stub);
    expect(steps.length).toBe(3);
    expect(steps[0].index).toBe(1);
    expect(steps[1].index).toBe(1.1);
    expect(steps[2].index).toBe(2);
  });

  it('detects completion when placeholder changes', () => {
    const edited = stub.replace('// placeholder', 'const x = 1;');
    const completion = computeStepCompletion(edited, stub);
    expect(completion[1]).toBe('in_progress');
    expect(completion[1.1]).toBe('not_started');
    expect(completion[2]).toBe('not_started');
  });

  it('rolls up nested steps into parent status', () => {
    const edited = stub.replace('// TODO(step 1.1 start)\n  // placeholder\n  // TODO(step 1.1 end)',
      '// TODO(step 1.1 start)\n  const value = 1;\n  // TODO(step 1.1 end)'
    );
    const completion = computeStepCompletion(edited, stub);
    expect(completion[1.1]).toBe('completed');
    expect(completion[1]).toBe('in_progress');
  });
});

describe('completion parser', () => {
  const base = `function demo() {\n  // Step 1: Do thing\n  // TODO(step 1 start)\n\n  // TODO(step 1 end)\n}`;

  it('empty region -> not started', () => {
    const completion = computeStepCompletion(base, base);
    expect(completion[1]).toBe('not_started');
  });

  it('whitespace only -> not started', () => {
    const edited = base.replace('// TODO(step 1 start)\n\n  // TODO(step 1 end)', '// TODO(step 1 start)\n   \n  // TODO(step 1 end)');
    const completion = computeStepCompletion(edited, base);
    expect(completion[1]).toBe('not_started');
  });

  it('comments only -> not started', () => {
    const edited = base.replace('// TODO(step 1 start)\n\n  // TODO(step 1 end)', '// TODO(step 1 start)\n  // just a comment\n  // TODO(step 1 end)');
    const completion = computeStepCompletion(edited, base);
    expect(completion[1]).toBe('not_started');
  });

  it('one line of code -> completed', () => {
    const edited = base.replace('// TODO(step 1 start)\n\n  // TODO(step 1 end)', '// TODO(step 1 start)\n  const x = 1;\n  // TODO(step 1 end)');
    const completion = computeStepCompletion(edited, base);
    expect(completion[1]).toBe('completed');
  });

  it('single character -> in progress', () => {
    const edited = base.replace('// TODO(step 1 start)\n\n  // TODO(step 1 end)', '// TODO(step 1 start)\n  x\n  // TODO(step 1 end)');
    const completion = computeStepCompletion(edited, base);
    expect(completion[1]).toBe('in_progress');
  });

  it('single symbol -> in progress', () => {
    const edited = base.replace('// TODO(step 1 start)\n\n  // TODO(step 1 end)', '// TODO(step 1 start)\n  ;\n  // TODO(step 1 end)');
    const completion = computeStepCompletion(edited, base);
    expect(completion[1]).toBe('in_progress');
  });

  it('code plus comments -> completed', () => {
    const edited = base.replace('// TODO(step 1 start)\n\n  // TODO(step 1 end)', '// TODO(step 1 start)\n  // note\n  const x = 1;\n  // TODO(step 1 end)');
    const completion = computeStepCompletion(edited, base);
    expect(completion[1]).toBe('completed');
  });
});
