import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { transform } from 'sucrase';
import { ErrorType, classifyError } from './runnerUtils';
import { ReactDebuggingFile, ReactDebuggingProblem } from '../types/reactDebugging';

export type DebuggingResult = {
  ok: boolean;
  errorType?: ErrorType;
  error?: string;
  results: { name: string; passed: boolean; error?: string }[];
  logs: string[];
};

export type PreviewResult = {
  ok: boolean;
  errorType?: ErrorType;
  error?: string;
  logs: string[];
  dispose?: () => void;
};

type TestCase = {
  name: string;
  run: (ctx: {
    React: typeof React;
    render: typeof render;
    screen: typeof screen;
    fireEvent: typeof fireEvent;
    act: typeof act;
    expect: ReturnType<typeof createExpect>;
  }) => void | Promise<void>;
};

const MAX_LOG_LINES = 80;
const MAX_LOG_CHARS = 4000;
const MAX_LOG_NOTICE = '[console output truncated]';
const RESOLVABLE_EXTENSIONS = ['', '.tsx', '.ts', '.json', '.css', '/index.tsx', '/index.ts'];

const createExpect = () => {
  const toBe = (received: unknown, expected: unknown) => {
    if (received !== expected) throw new Error(`Expected ${String(received)} to be ${String(expected)}`);
  };
  const toEqual = (received: unknown, expected: unknown) => {
    if (JSON.stringify(received) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`);
    }
  };
  const toContain = (received: string, expected: string) => {
    if (!received.includes(expected)) throw new Error(`Expected "${received}" to contain "${expected}"`);
  };
  const toHaveTextContent = (received: HTMLElement, expected: string) => {
    if (!received.textContent?.includes(expected)) {
      throw new Error(`Expected element text to contain "${expected}"`);
    }
  };
  const toHaveValue = (received: HTMLInputElement, expected: string) => {
    if (received.value !== expected) throw new Error(`Expected "${received.value}" to equal "${expected}"`);
  };
  const toBeGreaterThan = (received: number, expected: number) => {
    if (!(received > expected)) throw new Error(`Expected ${received} to be greater than ${expected}`);
  };
  return (received: any) => ({
    toBe: (expected: any) => toBe(received, expected),
    toEqual: (expected: any) => toEqual(received, expected),
    toContain: (expected: string) => toContain(String(received), expected),
    toHaveTextContent: (expected: string) => toHaveTextContent(received as HTMLElement, expected),
    toHaveValue: (expected: string) => toHaveValue(received as HTMLInputElement, expected),
    toBeTruthy: () => {
      if (!received) throw new Error('Expected value to be truthy');
    },
    toBeFalsy: () => {
      if (received) throw new Error('Expected value to be falsy');
    },
    toBeGreaterThan: (expected: number) => toBeGreaterThan(Number(received), expected)
  });
};

const createLogger = () => {
  const logs: string[] = [];
  const originalConsole = { ...console };
  const push = (line: string) => {
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
  console.log = (...args: unknown[]) => push(args.map(String).join(' '));
  console.warn = (...args: unknown[]) => push(args.map(String).join(' '));
  console.error = (...args: unknown[]) => push(args.map(String).join(' '));
  return { logs, restore: () => Object.assign(console, originalConsole) };
};

export const normalizeDebuggingPath = (path: string) => {
  const clean = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  return clean.startsWith('/') ? clean : `/${clean}`;
};

export const resolveDebuggingImport = (
  fromPath: string,
  request: string,
  files: Pick<ReactDebuggingFile, 'path'>[]
) => {
  if (!request.startsWith('.')) return request;
  const from = normalizeDebuggingPath(fromPath);
  const base = from.slice(0, from.lastIndexOf('/') + 1);
  const target = new URL(request, `file://${base}`).pathname;
  const normalized = normalizeDebuggingPath(target);
  const fileSet = new Set(files.map((file) => normalizeDebuggingPath(file.path)));
  for (const extension of RESOLVABLE_EXTENSIONS) {
    const candidate = normalizeDebuggingPath(`${normalized}${extension}`);
    if (fileSet.has(candidate)) return candidate;
  }
  throw new Error(`Cannot resolve module "${request}" from "${fromPath}"`);
};

export const listDebuggingSymbols = (file: ReactDebuggingFile) => {
  if (file.language !== 'tsx' && file.language !== 'ts') return [];
  const matches = file.contents.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g);
  return Array.from(matches, (match) => match[1]);
};

export const searchDebuggingFiles = (files: ReactDebuggingFile[], query: string) => {
  const term = query.trim().toLowerCase();
  if (!term) return files.map((file) => ({ path: file.path, hits: 0 }));
  return files
    .map((file) => ({
      path: file.path,
      hits: file.contents.toLowerCase().split(term).length - 1
    }))
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.path.localeCompare(b.path));
};

export const buildEditableFileMap = (
  problem: ReactDebuggingProblem,
  edits: Record<string, string>
): ReactDebuggingFile[] => {
  return problem.codebase.files.map((file) => {
    const normalizedPath = normalizeDebuggingPath(file.path);
    return {
      ...file,
      path: normalizedPath,
      contents: edits[normalizedPath] ?? edits[file.path] ?? file.contents
    };
  });
};

export const validateReactDebuggingSubmission = (
  problem: ReactDebuggingProblem,
  edits: Record<string, string>
) => {
  const errors: string[] = [];
  const editedPaths = new Set(Object.keys(edits).map(normalizeDebuggingPath));
  const files = buildEditableFileMap(problem, edits);
  const fileMap = new Map(files.map((file) => [normalizeDebuggingPath(file.path), file]));

  if (!fileMap.has(normalizeDebuggingPath(problem.entryFile))) {
    errors.push(`Entry file "${problem.entryFile}" does not exist.`);
  }

  for (const path of editedPaths) {
    const file = fileMap.get(path);
    if (!file) {
      errors.push(`Edited file "${path}" is not part of the challenge.`);
      continue;
    }
    if (!file.editable) {
      errors.push(`File "${path}" is read-only.`);
    }
  }

  if (problem.allowedEditablePaths?.length) {
    const allowed = new Set(problem.allowedEditablePaths.map(normalizeDebuggingPath));
    for (const path of editedPaths) {
      if (!allowed.has(path)) {
        errors.push(`File "${path}" is outside the allowed editable paths.`);
      }
    }
  }

  if (problem.forbiddenPaths?.length) {
    const forbidden = new Set(problem.forbiddenPaths.map(normalizeDebuggingPath));
    for (const path of editedPaths) {
      if (forbidden.has(path)) {
        errors.push(`File "${path}" cannot be modified for this challenge.`);
      }
    }
  }

  return errors;
};

const compileModule = (file: ReactDebuggingFile) => {
  if (file.language === 'json') {
    return { kind: 'json' as const, code: file.contents };
  }
  if (file.language === 'css') {
    return { kind: 'css' as const, code: file.contents };
  }
  return {
    kind: 'script' as const,
    code: transform(file.contents, {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxPragma: 'React.createElement',
      jsxFragmentPragma: 'React.Fragment'
    }).code
  };
};

class PreviewBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    const error = this.state.error as Error | null;
    if (error) return React.createElement('div', { 'data-testid': 'preview-error' }, error.message);
    return this.props.children;
  }
}

const createRuntime = (files: ReactDebuggingFile[]) => {
  const normalizedFiles = files.map((file) => ({ ...file, path: normalizeDebuggingPath(file.path) }));
  const fileMap = new Map(normalizedFiles.map((file) => [file.path, file]));
  const cache = new Map<string, any>();
  const styles: HTMLStyleElement[] = [];

  const loadModule = (path: string): any => {
    if (cache.has(path)) return cache.get(path);
    const file = fileMap.get(path);
    if (!file) throw new Error(`Cannot resolve module "${path}"`);
    const compiled = compileModule(file);
    if (compiled.kind === 'json') {
      const parsed = JSON.parse(compiled.code);
      cache.set(path, parsed);
      return parsed;
    }
    if (compiled.kind === 'css') {
      const style = document.createElement('style');
      style.setAttribute('data-debug-style', path);
      style.textContent = compiled.code;
      document.head.appendChild(style);
      styles.push(style);
      const exports = {};
      cache.set(path, exports);
      return exports;
    }

    const module = { exports: {} as any };
    cache.set(path, module.exports);
    const localRequire = (request: string) => {
      if (request === 'react') return React;
      if (request === 'react-dom/client') return { createRoot };
      if (request === '@testing-library/react') return { render, screen, fireEvent, act, cleanup, within };
      if (request.startsWith('.')) return loadModule(resolveDebuggingImport(path, request, normalizedFiles));
      throw new Error(`Cannot resolve module "${request}" from "${path}"`);
    };
    const fn = new Function('require', 'module', 'exports', 'React', compiled.code);
    fn(localRequire, module, module.exports, React);
    cache.set(path, module.exports);
    return module.exports;
  };

  return {
    loadModule,
    dispose: () => {
      styles.forEach((style) => style.remove());
      cache.clear();
    }
  };
};

const withTimeout = async <T>(task: Promise<T>, timeoutMs: number): Promise<T> => {
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

const getEntryComponent = (exports: Record<string, unknown>) => {
  if (typeof exports.default === 'function') return exports.default as React.ComponentType;
  if (typeof exports.App === 'function') return exports.App as React.ComponentType;
  throw new Error('Entry module must export a default component or App.');
};

export const runReactDebuggingPreview = async ({
  problem,
  edits,
  container,
  timeoutMs = 1500
}: {
  problem: ReactDebuggingProblem;
  edits: Record<string, string>;
  container: HTMLElement;
  timeoutMs?: number;
}): Promise<PreviewResult> => {
  const logger = createLogger();
  const files = buildEditableFileMap(problem, edits);
  const validationErrors = validateReactDebuggingSubmission(problem, edits);
  if (validationErrors.length) {
    logger.restore();
    return {
      ok: false,
      errorType: 'HARNESS_ERROR',
      error: validationErrors[0],
      logs: logger.logs
    };
  }

  let root: Root | null = null;
  let runtime: ReturnType<typeof createRuntime> | null = null;
  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        container.innerHTML = '';
        runtime = createRuntime(files);
        const entry = runtime.loadModule(normalizeDebuggingPath(problem.entryFile));
        const App = getEntryComponent(entry);
        const mount = document.createElement('div');
        container.appendChild(mount);
        const nextRoot = createRoot(mount);
        root = nextRoot;
        nextRoot.render(
          React.createElement(
            PreviewBoundary,
            { onError: (error: Error) => reject(error), children: React.createElement(App) },
          )
        );
        window.setTimeout(resolve, 0);
      }),
      timeoutMs
    );
    logger.restore();
    return {
      ok: true,
      logs: logger.logs,
      dispose: () => {
        root?.unmount();
        runtime?.dispose();
        container.innerHTML = '';
      }
    };
  } catch (error) {
    const mountedRoot = root as Root | null;
    const activeRuntime = runtime as ReturnType<typeof createRuntime> | null;
    if (mountedRoot) mountedRoot.unmount();
    if (activeRuntime) activeRuntime.dispose();
    logger.restore();
    return {
      ok: false,
      errorType: classifyError(error),
      error: (error as Error).message,
      logs: logger.logs
    };
  }
};

const loadTests = (
  files: ReactDebuggingFile[],
  testCode: string
): TestCase[] => {
  const runtime = createRuntime([
    ...files,
    {
      path: '/__tests__.tsx',
      language: 'tsx',
      contents: testCode,
      editable: false
    }
  ]);
  const testExports = runtime.loadModule('/__tests__.tsx');
  const tests = testExports.tests ?? [];
  if (!Array.isArray(tests)) {
    runtime.dispose();
    throw new Error('Test module must export a tests array.');
  }
  return tests;
};

export const runReactDebuggingTests = async ({
  problem,
  edits,
  testCode,
  timeoutMs = 1500
}: {
  problem: ReactDebuggingProblem;
  edits: Record<string, string>;
  testCode: string;
  timeoutMs?: number;
}): Promise<DebuggingResult> => {
  const logger = createLogger();
  const results: { name: string; passed: boolean; error?: string }[] = [];
  const files = buildEditableFileMap(problem, edits);
  const validationErrors = validateReactDebuggingSubmission(problem, edits);
  if (validationErrors.length) {
    logger.restore();
    return { ok: false, errorType: 'HARNESS_ERROR', error: validationErrors[0], results, logs: logger.logs };
  }

  try {
    const initialTests = loadTests(files, testCode);
    for (let index = 0; index < initialTests.length; index += 1) {
      cleanup();
      const runtimeFiles = buildEditableFileMap(problem, edits);
      const tests = loadTests(runtimeFiles, testCode);
      const test = tests[index];
      const host = document.createElement('div');
      document.body.appendChild(host);
      const localRender = (ui: React.ReactElement, options?: Parameters<typeof render>[1]) =>
        render(ui, { container: host, baseElement: host, ...options });
      const localScreen = within(host);
      const expect = createExpect();
      try {
        await withTimeout(
          Promise.resolve(test.run({ React, render: localRender as typeof render, screen: localScreen as typeof screen, fireEvent, act, expect })),
          timeoutMs
        );
        results.push({ name: test.name, passed: true });
      } catch (error) {
        results.push({ name: test.name, passed: false, error: (error as Error).message });
      } finally {
        cleanup();
        host.remove();
      }
    }
    logger.restore();
    const ok = results.every((result) => result.passed);
    return {
      ok,
      errorType: ok ? undefined : results.some((result) => result.error === 'Timeout') ? 'TIMEOUT' : 'TEST_FAILURE',
      results,
      logs: logger.logs
    };
  } catch (error) {
    logger.restore();
    return {
      ok: false,
      errorType: classifyError(error),
      error: (error as Error).message,
      results,
      logs: logger.logs
    };
  }
};

export const submitReactDebuggingSolution = async ({
  problem,
  edits,
  timeoutMs = 1500
}: {
  problem: ReactDebuggingProblem;
  edits: Record<string, string>;
  timeoutMs?: number;
}) => {
  return runReactDebuggingTests({
    problem,
    edits,
    testCode: `${problem.tests.visible}\n${problem.tests.hidden}`,
    timeoutMs
  });
};
