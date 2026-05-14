import ts from 'typescript';
import { classifyError, ErrorType } from './runnerUtils';

type TestCase = {
  name: string;
  run: (ctx: { module: Record<string, any>; expect: ReturnType<typeof createExpect> }) => void | Promise<void>;
};

export type DataStructureExecutionResult = {
  ok: boolean;
  results: { name: string; passed: boolean; error?: string }[];
  logs: string[];
  error?: string;
  errorType?: ErrorType;
};

const MAX_LOG_LINES = 50;
const MAX_LOG_CHARS = 2000;
const MAX_LOG_NOTICE = '[console output truncated]';

const serialize = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const createExpect = () => {
  const toBe = (received: unknown, expected: unknown) => {
    if (!Object.is(received, expected)) {
      throw new Error(`Expected ${String(received)} to be ${String(expected)}`);
    }
  };

  const toEqual = (received: unknown, expected: unknown) => {
    if (JSON.stringify(received) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`);
    }
  };

  const toBeTruthy = (received: unknown) => {
    if (!received) throw new Error('Expected value to be truthy');
  };

  const toBeFalsy = (received: unknown) => {
    if (received) throw new Error('Expected value to be falsy');
  };

  const toContain = (received: unknown[] | string, expected: unknown) => {
    if (Array.isArray(received)) {
      if (!received.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(received)} to contain ${JSON.stringify(expected)}`);
      }
      return;
    }
    if (!String(received).includes(String(expected))) {
      throw new Error(`Expected ${String(received)} to contain ${String(expected)}`);
    }
  };

  return (received: unknown) => ({
    toBe: (expected: unknown) => toBe(received, expected),
    toEqual: (expected: unknown) => toEqual(received, expected),
    toBeTruthy: () => toBeTruthy(received),
    toBeFalsy: () => toBeFalsy(received),
    toContain: (expected: unknown) => toContain(received as unknown[] | string, expected)
  });
};

const compile = (code: string) =>
  ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS
    }
  }).outputText;

const evalModule = (code: string, globals: Record<string, unknown> = {}) => {
  const module = { exports: {} as Record<string, unknown> };
  const exports = module.exports;
  const fn = new Function(
    'module',
    'exports',
    'window',
    'document',
    'navigator',
    'location',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'expect',
    code
  );
  fn(
    module,
    exports,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    globals.expect
  );
  return module.exports;
};

export const executeDataStructureTests = async ({
  code,
  testCode
}: {
  code: string;
  testCode: string;
}): Promise<DataStructureExecutionResult> => {
  const logs: string[] = [];
  const originalConsole = { ...console };

  const pushLog = (...args: unknown[]) => {
    if (logs.length >= MAX_LOG_LINES) {
      if (logs[logs.length - 1] !== MAX_LOG_NOTICE) logs.push(MAX_LOG_NOTICE);
      return;
    }
    const line = args.map(serialize).join(' ');
    const currentLength = logs.reduce((sum, item) => sum + item.length, 0);
    if (currentLength + line.length > MAX_LOG_CHARS) {
      logs.push(MAX_LOG_NOTICE);
      return;
    }
    logs.push(line);
  };

  console.log = pushLog;
  console.warn = pushLog;
  console.error = pushLog;

  try {
    const expect = createExpect();
    const userExports = evalModule(compile(code));
    const testExports = evalModule(compile(testCode), { expect });
    const tests = testExports.tests as TestCase[] | undefined;

    if (!Array.isArray(tests)) {
      const harnessError: Error & { type?: ErrorType } = new Error('Test module must export a tests array.');
      harnessError.type = 'HARNESS_ERROR';
      throw harnessError;
    }

    const results: DataStructureExecutionResult['results'] = [];
    for (const test of tests) {
      try {
        await test.run({ module: userExports, expect });
        results.push({ name: test.name, passed: true });
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const ok = results.every((result) => result.passed);
    return {
      ok,
      results,
      logs,
      errorType: ok ? undefined : 'TEST_FAILURE'
    };
  } catch (error) {
    return {
      ok: false,
      results: [],
      logs,
      error: error instanceof Error ? error.message : String(error),
      errorType: (error as Error & { type?: ErrorType }).type ?? classifyError(error)
    };
  } finally {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
};
