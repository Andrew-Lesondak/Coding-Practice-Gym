import { computeDesignStepStatus, parseDesignSteps } from '../lib/systemDesignStub';

describe('system design stub parsing', () => {
  const stub = `## Step 1: Requirements and scope
[TEMPLATE_START step=1]
- TODO
[TEMPLATE_END step=1]

## Step 2: APIs
[TEMPLATE_START step=2]
- TODO
[TEMPLATE_END step=2]
`;

  it('parses steps', () => {
    const steps = parseDesignSteps(stub);
    expect(steps).toHaveLength(2);
    expect(steps[0].index).toBe(1);
  });

  it('detects completion inside template region', () => {
    const edited = stub.replace('- TODO', '- Done: add API');
    const status = computeDesignStepStatus(edited, stub);
    expect(status[1]).toBe('completed');
  });

  it('does not complete when only TODO remains', () => {
    const status = computeDesignStepStatus(stub, stub);
    expect(status[1]).toBe('not_started');
  });

  it('does not complete with a single character', () => {
    const edited = stub.replace('- TODO', '- x');
    const status = computeDesignStepStatus(edited, stub);
    expect(status[1]).toBe('in_progress');
  });
});
