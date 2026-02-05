import { classifyError, deepEqual, stableStringify } from '../lib/runnerUtils';

describe('deepEqual', () => {
  it('treats NaN as equal', () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it('treats -0 and 0 as equal', () => {
    expect(deepEqual(-0, 0)).toBe(true);
  });

  it('handles nested objects', () => {
    const a = { b: [1, { c: 2 }] };
    const b = { b: [1, { c: 2 }] };
    expect(deepEqual(a, b)).toBe(true);
  });
});

describe('stableStringify', () => {
  it('orders keys deterministically', () => {
    const value = { b: 2, a: 1 };
    expect(stableStringify(value)).toBe('{"a":1,"b":2}');
  });

  it('represents NaN and -0 consistently', () => {
    expect(stableStringify(NaN)).toBe('NaN');
    expect(stableStringify(-0)).toBe('0');
  });
});

describe('classifyError', () => {
  it('classifies syntax errors', () => {
    expect(classifyError(new SyntaxError('bad'))).toBe('SYNTAX_ERROR');
  });

  it('classifies runtime errors', () => {
    expect(classifyError(new Error('oops'))).toBe('RUNTIME_ERROR');
  });
});
