import React from 'react';
import { render, cleanup, screen, fireEvent, act, within, createEvent } from '@testing-library/react';
import { transform } from 'sucrase';
import { ErrorType, classifyError } from './runnerUtils';
import { UnitTestingFile, UnitTestingMutant, UnitTestingProblem } from '../types/unitTesting';

export type UnitTestingRunResult = {
  ok: boolean;
  errorType?: ErrorType;
  error?: string;
  results: { name: string; passed: boolean; error?: string }[];
  logs: string[];
  weakMutants?: { id: string; description?: string }[];
};

type CollectedTest = {
  name: string;
  run: () => void | Promise<void>;
};

const MAX_LOG_LINES = 80;
const MAX_LOG_CHARS = 4000;
const MAX_LOG_NOTICE = '[console output truncated]';
const RESOLVABLE_EXTENSIONS = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];

const createExpect = () => {
  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
  };

  const matcherFactory = (received: any, negate = false) => {
    const invert = (condition: boolean, message: string) => {
      if (negate ? condition : !condition) {
        throw new Error(negate ? `Expected not: ${message}` : message);
      }
    };

    return {
      get not() {
        return matcherFactory(received, !negate);
      },
      toBe: (expected: any) => invert(Object.is(received, expected), `Expected ${String(received)} to be ${String(expected)}`),
      toEqual: (expected: any) =>
        invert(JSON.stringify(received) === JSON.stringify(expected), `Expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`),
      toContain: (expected: string) =>
        invert(String(received).includes(expected), `Expected "${String(received)}" to contain "${expected}"`),
      toBeTruthy: () => invert(Boolean(received), 'Expected value to be truthy'),
      toBeFalsy: () => invert(!received, 'Expected value to be falsy'),
      toBeNull: () => invert(received === null, `Expected ${String(received)} to be null`),
      toHaveTextContent: (expected: string) =>
        invert(Boolean((received as HTMLElement | null)?.textContent?.includes(expected)), `Expected element text to contain "${expected}"`),
      toHaveValue: (expected: string) =>
        invert((received as HTMLInputElement | null)?.value === expected, `Expected value "${(received as HTMLInputElement | null)?.value}" to equal "${expected}"`),
      toBeInTheDocument: () => invert(Boolean(received && document.body.contains(received)), 'Expected element to be in the document'),
      toBeDisabled: () => invert(Boolean((received as HTMLButtonElement | null)?.disabled), 'Expected element to be disabled'),
      toThrow: (expected?: string) => {
        assert(typeof received === 'function', 'toThrow expects a function');
        try {
          received();
        } catch (error) {
          if (!expected) {
            invert(true, '');
            return;
          }
          invert(String((error as Error).message).includes(expected), `Expected thrown error to contain "${expected}"`);
          return;
        }
        throw new Error('Expected function to throw');
      },
      rejects: {
        toThrow: async (expected?: string) => {
          try {
            await received;
          } catch (error) {
            if (!expected) return;
            invert(String((error as Error).message).includes(expected), `Expected rejection to contain "${expected}"`);
            return;
          }
          throw new Error('Expected promise to reject');
        }
      }
    };
  };

  return matcherFactory;
};

const createLogger = () => {
  const logs: string[] = [];
  const originalConsole = { ...console };
  const push = (line: string) => {
    if (logs.length >= MAX_LOG_LINES) {
      if (logs[logs.length - 1] !== MAX_LOG_NOTICE) logs.push(MAX_LOG_NOTICE);
      return;
    }
    const currentChars = logs.reduce((sum, item) => sum + item.length, 0);
    if (currentChars + line.length > MAX_LOG_CHARS) {
      logs.push(MAX_LOG_NOTICE);
      return;
    }
    logs.push(line);
  };
  console.log = (...args: unknown[]) => push(args.map(String).join(' '));
  console.warn = (...args: unknown[]) => push(args.map(String).join(' '));
  console.error = (...args: unknown[]) => push(args.map(String).join(' '));
  return {
    logs,
    restore: () => Object.assign(console, originalConsole)
  };
};

const normalizeUnitPath = (path: string) => {
  const clean = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  return clean.startsWith('/') ? clean : `/${clean}`;
};

const resolveRelativePath = (fromPath: string, request: string) => {
  const baseParts = normalizeUnitPath(fromPath).split('/');
  baseParts.pop();
  for (const part of request.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (baseParts.length > 1) baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }
  return normalizeUnitPath(baseParts.join('/'));
};

export const resolveUnitTestingImport = (
  fromPath: string,
  request: string,
  files: Pick<UnitTestingFile | { path: string }, 'path'>[]
) => {
  if (!request.startsWith('.')) return request;
  const normalized = resolveRelativePath(fromPath, request);
  const fileSet = new Set(files.map((file) => normalizeUnitPath(file.path)));
  for (const extension of RESOLVABLE_EXTENSIONS) {
    const candidate = normalizeUnitPath(`${normalized}${extension}`);
    if (fileSet.has(candidate)) return candidate;
  }
  throw new Error(`Cannot resolve module "${request}" from "${fromPath}"`);
};

const compileModule = (file: Pick<UnitTestingFile, 'language' | 'contents'>) =>
  transform(file.contents, {
    transforms: ['typescript', 'jsx', 'imports'],
    jsxPragma: 'React.createElement',
    jsxFragmentPragma: 'React.Fragment'
  }).code;

const buildSourceFiles = (
  problem: UnitTestingProblem,
  testCode: string,
  mutant?: UnitTestingMutant
) => {
  const mutantMap = new Map((mutant?.mutatedFiles ?? []).map((file) => [normalizeUnitPath(file.path), file.contents]));
  return [
    ...problem.sourceFiles.map((file) => ({
      ...file,
      path: normalizeUnitPath(file.path),
      contents: mutantMap.get(normalizeUnitPath(file.path)) ?? file.contents
    })),
    {
      path: normalizeUnitPath(problem.testStubFile.path),
      language: problem.testStubFile.language,
      editable: true,
      contents: testCode
    }
  ];
};

type RuntimeOverrides = {
  require?: Record<string, unknown>;
};

const createRuntime = (
  files: Array<UnitTestingFile | { path: string; language: 'ts' | 'tsx' | 'js' | 'jsx'; contents: string; editable?: boolean }>,
  overrides: RuntimeOverrides = {}
) => {
  const normalizedFiles = files.map((file) => ({ ...file, path: normalizeUnitPath(file.path) }));
  const fileMap = new Map(normalizedFiles.map((file) => [file.path, file]));
  const cache = new Map<string, any>();

  const loadModule = (path: string): any => {
    if (cache.has(path)) return cache.get(path);
    const file = fileMap.get(path);
    if (!file) throw new Error(`Cannot resolve module "${path}"`);
    const module = { exports: {} as any };
    cache.set(path, module.exports);
    const localRequire = (request: string) => {
      if (request in (overrides.require ?? {})) return overrides.require?.[request];
      if (request === 'react') return React;
      if (request === '@testing-library/react') return { render, screen, fireEvent, act, cleanup, within, createEvent };
      if (request.startsWith('.')) return loadModule(resolveUnitTestingImport(path, request, normalizedFiles));
      throw new Error(`Cannot resolve module "${request}" from "${path}"`);
    };
    const fn = new Function('require', 'module', 'exports', 'React', compileModule(file),);
    fn(localRequire, module, module.exports, React);
    cache.set(path, module.exports);
    return module.exports;
  };

  return { loadModule };
};

const withTimeout = async <T>(task: Promise<T>, timeoutMs: number) => {
  let timer = 0 as unknown as number;
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error('Timeout')), timeoutMs);
      })
    ]);
  } finally {
    window.clearTimeout(timer);
  }
};

const collectTests = (files: UnitTestingFile[], testPath: string) => {
  const tests: CollectedTest[] = [];
  const beforeEachFns: Array<() => void | Promise<void>> = [];
  const afterEachFns: Array<() => void | Promise<void>> = [];
  const describeStack: string[] = [];
  const expect = createExpect();

  let activeRender: typeof render = render;
  let activeScreen: typeof screen | ReturnType<typeof within> = screen;

  const renderProxy = (...args: Parameters<typeof render>) => activeRender(...args);
  const screenProxy = new Proxy(
    {},
    { get: (_target, prop) => (activeScreen as any)[prop] }
  );

  const it = (name: string, fn: () => void | Promise<void>) => {
    tests.push({
      name: [...describeStack, name].join(' > '),
      run: async () => {
        for (const hook of beforeEachFns) await hook();
        await fn();
        for (const hook of afterEachFns) await hook();
      }
    });
  };

  const vitestModule = {
    describe: (name: string, fn: () => void) => {
      describeStack.push(name);
      try {
        fn();
      } finally {
        describeStack.pop();
      }
    },
    it,
    test: it,
    expect,
    beforeEach: (fn: () => void | Promise<void>) => beforeEachFns.push(fn),
    afterEach: (fn: () => void | Promise<void>) => afterEachFns.push(fn),
    vi: {
      fn: (impl?: (...args: any[]) => any) => {
        const mock = (...args: any[]) => {
          mock.mock.calls.push(args);
          return impl?.(...args);
        };
        mock.mock = { calls: [] as any[][] };
        return mock;
      }
    }
  };

  const runtime = createRuntime(files, {
    require: {
      vitest: vitestModule,
      '@testing-library/react': {
        render: renderProxy,
        screen: screenProxy,
        fireEvent,
        act,
        cleanup,
        within,
        createEvent
      }
    }
  });

  runtime.loadModule(normalizeUnitPath(testPath));

  return {
    tests,
    expect,
    setActiveScreen: (value: typeof screen | ReturnType<typeof within>) => {
      activeScreen = value;
    },
    setActiveRender: (value: typeof render) => {
      activeRender = value;
    }
  };
};

const runAgainstFiles = async ({
  files,
  testPath,
  timeoutMs
}: {
  files: UnitTestingFile[];
  testPath: string;
  timeoutMs: number;
}) => {
  const results: { name: string; passed: boolean; error?: string }[] = [];
  const collected = collectTests(files, testPath);
  const previousExpect = (globalThis as { expect?: ReturnType<typeof createExpect> }).expect;
  (globalThis as { expect?: ReturnType<typeof createExpect> }).expect = collected.expect;
  try {
    for (const test of collected.tests) {
      cleanup();
      const host = document.createElement('div');
      document.body.appendChild(host);
      const localRender = ((ui: React.ReactElement, options?: Parameters<typeof render>[1]) => {
        const container = options?.container ?? host;
        const baseElement = options?.baseElement ?? container;
        return render(ui, { ...options, container, baseElement });
      }) as typeof render;
      collected.setActiveRender(localRender);
      collected.setActiveScreen(within(host));
      try {
        await withTimeout(Promise.resolve(test.run()), timeoutMs);
        results.push({ name: test.name, passed: true });
      } catch (error) {
        results.push({ name: test.name, passed: false, error: (error as Error).message });
      } finally {
        cleanup();
        host.remove();
      }
    }
  } finally {
    if (previousExpect) {
      (globalThis as { expect?: ReturnType<typeof createExpect> }).expect = previousExpect;
    } else {
      delete (globalThis as { expect?: ReturnType<typeof createExpect> }).expect;
    }
  }
  return results;
};

export const runUnitTestingTests = async ({
  problem,
  testCode,
  mutant,
  timeoutMs = 1500
}: {
  problem: UnitTestingProblem;
  testCode: string;
  mutant?: UnitTestingMutant;
  timeoutMs?: number;
}): Promise<UnitTestingRunResult> => {
  const logger = createLogger();
  try {
    const files = buildSourceFiles(problem, testCode, mutant);
    const results = await runAgainstFiles({
      files,
      testPath: problem.testStubFile.path,
      timeoutMs
    });
    const ok = results.every((result) => result.passed);
    logger.restore();
    return {
      ok,
      results,
      logs: logger.logs,
      errorType: ok ? undefined : results.some((result) => result.error === 'Timeout') ? 'TIMEOUT' : 'TEST_FAILURE'
    };
  } catch (error) {
    logger.restore();
    return {
      ok: false,
      errorType: classifyError(error),
      error: (error as Error).message,
      results: [],
      logs: logger.logs
    };
  }
};

export const submitUnitTestingSolution = async ({
  problem,
  testCode,
  timeoutMs = 1500
}: {
  problem: UnitTestingProblem;
  testCode: string;
  timeoutMs?: number;
}): Promise<UnitTestingRunResult> => {
  const visible = await runUnitTestingTests({ problem, testCode, timeoutMs });
  if (!visible.ok) return visible;

  const weakMutants: { id: string; description?: string }[] = [];
  for (const mutant of problem.hiddenMutants) {
    const mutantResult = await runUnitTestingTests({ problem, testCode, mutant, timeoutMs });
    if (mutantResult.ok) {
      weakMutants.push({ id: mutant.id, description: mutant.description });
    }
  }

  if (weakMutants.length > 0) {
    return {
      ok: false,
      errorType: 'WEAK_TEST_FAILURE',
      error: `Your tests passed the main implementation but missed ${weakMutants.length} hidden mutant${weakMutants.length === 1 ? '' : 's'}.`,
      results: visible.results,
      logs: visible.logs,
      weakMutants
    };
  }

  return visible;
};
