import { describe, it, expect } from 'vitest';
import { runReactTests } from '../lib/reactRunner';

describe('react runner', () => {
  it('classifies harness errors', async () => {
    const result = await runReactTests({
      userCode: `export const Thing = () => null;`,
      testCode: `import { Thing } from 'user';\nimport { nope } from 'unknown';\nexport const tests = [{ name: 'noop', run: () => { if (nope) { Thing(); } } }];`
    });
    expect(result.ok).toBe(false);
    expect(result.errorType).toBe('HARNESS_ERROR');
  });

  it('classifies test failures', async () => {
    const result = await runReactTests({
      userCode: `export const Thing = () => 'hi';`,
      testCode: `import { Thing } from 'user';\nexport const tests = [{ name: 'fails', run: () => { const output = Thing(); expect(output).toBe('nope'); } }];`
    });
    expect(result.ok).toBe(false);
    expect(result.errorType).toBe('TEST_FAILURE');
  });

  it('classifies timeouts', async () => {
    const result = await runReactTests({
      userCode: `export const Thing = () => null;`,
      testCode: `import { Thing } from 'user';\nexport const tests = [{ name: 'hang', run: () => new Promise(() => {}) }];`,
      timeoutMs: 20
    });
    expect(result.ok).toBe(false);
    expect(result.errorType).toBe('TIMEOUT');
  });
});
