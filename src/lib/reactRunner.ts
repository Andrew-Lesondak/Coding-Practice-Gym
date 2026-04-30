import React from 'react';
import { render, cleanup, screen, fireEvent, act, within } from '@testing-library/react';
import { transform } from 'sucrase';
import { ErrorType, classifyError } from './runnerUtils';

export type ReactRunResult = {
  ok: boolean;
  errorType?: ErrorType;
  error?: string;
  results: { name: string; passed: boolean; error?: string }[];
  logs: string[];
};

type TestCase = {
  name: string;
  run: (ctx: {
    React: typeof React;
    render: any;
    screen: any;
    fireEvent: typeof fireEvent;
    act: typeof act;
    expect: any;
  }) => void | Promise<void>;
};

const MAX_LOG_LINES = 50;
const MAX_LOG_CHARS = 2000;
const MAX_LOG_NOTICE = '[console output truncated]';

const createExpect = () => {
  const toBe = (received: unknown, expected: unknown) => {
    if (received !== expected) {
      throw new Error(`Expected ${String(received)} to be ${String(expected)}`);
    }
  };
  const toBeTruthy = (received: unknown) => {
    if (!received) throw new Error('Expected value to be truthy');
  };
  const toBeFalsy = (received: unknown) => {
    if (received) throw new Error('Expected value to be falsy');
  };
  const toEqual = (received: unknown, expected: unknown) => {
    if (JSON.stringify(received) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`);
    }
  };
  const toContain = (received: string, expected: string) => {
    if (!received.includes(expected)) {
      throw new Error(`Expected "${received}" to contain "${expected}"`);
    }
  };
  const toHaveTextContent = (received: HTMLElement, expected: string) => {
    if (!received.textContent?.includes(expected)) {
      throw new Error(`Expected element text to contain "${expected}"`);
    }
  };
  const toHaveValue = (received: HTMLInputElement, expected: string) => {
    if (received.value !== expected) {
      throw new Error(`Expected value "${received.value}" to be "${expected}"`);
    }
  };
  return (received: any) => ({
    toBe: (expected: any) => toBe(received, expected),
    toBeTruthy: () => toBeTruthy(received),
    toBeFalsy: () => toBeFalsy(received),
    toEqual: (expected: any) => toEqual(received, expected),
    toContain: (expected: string) => toContain(String(received), expected),
    toHaveTextContent: (expected: string) => toHaveTextContent(received as HTMLElement, expected),
    toHaveValue: (expected: string) => toHaveValue(received as HTMLInputElement, expected)
  });
};

const createLogger = () => {
  const logs: string[] = [];
  const originalConsole = { ...console };
  const pushLine = (line: string) => {
    if (logs.length >= MAX_LOG_LINES) {
      if (logs[logs.length - 1] !== MAX_LOG_NOTICE) logs.push(MAX_LOG_NOTICE);
      return;
    }
    const length = logs.reduce((sum, item) => sum + item.length, 0);
    if (length + line.length > MAX_LOG_CHARS) {
      logs.push(MAX_LOG_NOTICE);
      return;
    }
    logs.push(line);
  };
  console.log = (...args: unknown[]) => pushLine(args.map(String).join(' '));
  console.warn = (...args: unknown[]) => pushLine(args.map(String).join(' '));
  console.error = (...args: unknown[]) => pushLine(args.map(String).join(' '));
  return {
    logs,
    restore: () => Object.assign(console, originalConsole)
  };
};


const stripInlineReactFcGenerics = (code: string) => {
  const marker = ': React.FC<';
  let i = 0;
  let out = '';

  while (i < code.length) {
    const idx = code.indexOf(marker, i);
    if (idx === -1) {
      out += code.slice(i);
      break;
    }

    out += code.slice(i, idx);
    let j = idx + marker.length;
    let depth = 1;

    while (j < code.length && depth > 0) {
      const ch = code[j];
      if (ch === '<') depth += 1;
      else if (ch === '>') depth -= 1;
      j += 1;
    }

    if (depth !== 0) {
      out += marker;
      i = idx + marker.length;
      continue;
    }

    while (j < code.length && /\s/.test(code[j])) j += 1;
    if (code[j] === '=') {
      out += ' ';
      i = j;
      continue;
    }

    out += code.slice(idx, j);
    i = j;
  }

  return out;
};

const compileToCjs = (code: string) => {
  return transform(code, {
    transforms: ['typescript', 'jsx', 'imports'],
    jsxPragma: 'React.createElement',
    jsxFragmentPragma: 'React.Fragment'
  }).code;
};

const createRequire = (userExports: Record<string, any>, screenProxy: any, renderProxy: any) => {
  return (name: string) => {
    if (name === 'react') return React;
    if (name === '@testing-library/react') {
      return { render: renderProxy, screen: screenProxy, fireEvent, act, cleanup };
    }
    if (name === 'user') return userExports;
    throw new Error(`Unknown module: ${name}`);
  };
};

type SandboxGlobals = {
  window?: Window | undefined;
  document?: Document | undefined;
  navigator?: Navigator | undefined;
  location?: Location | undefined;
  fetch?: typeof fetch | undefined;
  XMLHttpRequest?: typeof XMLHttpRequest | undefined;
  WebSocket?: typeof WebSocket | undefined;
  expect?: ReturnType<typeof createExpect> | undefined;
  require?: (name: string) => any;
};

const evalCjsModule = (code: string, userExports: Record<string, any>, globals: SandboxGlobals = {}) => {
  const module = { exports: {} as any };
  const require = globals.require ?? createRequire(userExports, screen, render);
  const fn = new Function(
    'require',
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
    require,
    module,
    module.exports,
    globals.window,
    globals.document,
    globals.navigator,
    globals.location,
    globals.fetch,
    globals.XMLHttpRequest,
    globals.WebSocket,
    globals.expect
  );
  return module.exports;
};

const isHarnessError = (error: Error) => {
  return (
    error.message.includes('Unknown module') ||
    error.message.includes('tests must export') ||
    error.message.includes('Test module must export')
  );
};

export const runReactTests = async ({
  userCode,
  testCode,
  timeoutMs = 1500
}: {
  userCode: string;
  testCode: string | string[];
  timeoutMs?: number;
}): Promise<ReactRunResult> => {
  const logger = createLogger();
  const expect = createExpect();
  const results: { name: string; passed: boolean; error?: string }[] = [];
  const timeout = (ms: number) =>
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

  try {
    let activeScreen: any = screen;
    let activeRender: any = render;
    const screenProxy = new Proxy(
      {},
      {
        get: (_target, prop) => (activeScreen as any)[prop]
      }
    );
    const renderProxy = (...args: any[]) => activeRender(...args);
    const normalizedUserCode = stripInlineReactFcGenerics(userCode);
    const userJs = compileToCjs(normalizedUserCode);
    const userExports = evalCjsModule(userJs, {}, {
      window: undefined,
      document: undefined,
      navigator: undefined,
      location: undefined,
      fetch: undefined,
      XMLHttpRequest: undefined,
      WebSocket: undefined,
      expect: undefined
    });
    const testModules = Array.isArray(testCode) ? testCode : [testCode];
    const tests: TestCase[] = [];
    for (const moduleCode of testModules) {
      const testJs = compileToCjs(moduleCode);
      const testExports = evalCjsModule(testJs, userExports, {
        window: typeof window === 'undefined' ? undefined : window,
        document: typeof document === 'undefined' ? undefined : document,
        navigator: typeof navigator === 'undefined' ? undefined : navigator,
        location: typeof location === 'undefined' ? undefined : location,
        fetch: undefined,
        XMLHttpRequest: undefined,
        WebSocket: undefined,
        expect,
        require: createRequire(userExports, screenProxy, renderProxy)
      });
      const moduleTests: TestCase[] = testExports.tests ?? [];
      if (!Array.isArray(moduleTests)) {
        throw new Error('Test module must export a tests array.');
      }
      tests.push(...moduleTests);
    }
    let timeoutHit = false;
    for (const test of tests) {
      cleanup();
      const container = document.createElement('div');
      document.body.appendChild(container);
      const localRender = (ui: React.ReactElement, options?: Parameters<typeof render>[1]) =>
        render(ui, { container, baseElement: container, ...options });
      const scopedScreen = within(container);
      activeScreen = scopedScreen;
      activeRender = localRender;
      const ctx = { React, render: localRender, screen: scopedScreen, fireEvent, act, expect };
      try {
        await Promise.race([Promise.resolve(test.run(ctx)), timeout(timeoutMs)]);
        results.push({ name: test.name, passed: true });
      } catch (err) {
        const message = (err as Error).message;
        if (message === 'Timeout') timeoutHit = true;
        results.push({ name: test.name, passed: false, error: message });
      } finally {
        cleanup();
        container.remove();
      }
    }

    const ok = results.every((result) => result.passed);
    logger.restore();
    return {
      ok,
      results,
      logs: logger.logs,
      errorType: ok ? undefined : timeoutHit ? 'TIMEOUT' : 'TEST_FAILURE'
    };
  } catch (error) {
    logger.restore();
    const err = error as Error;
    const errorType =
      err.message === 'Timeout'
        ? 'TIMEOUT'
        : err instanceof SyntaxError
        ? 'SYNTAX_ERROR'
        : isHarnessError(err)
        ? 'HARNESS_ERROR'
        : classifyError(err);
    return {
      ok: false,
      errorType,
      error: err.message,
      results,
      logs: logger.logs
    };
  }
};
