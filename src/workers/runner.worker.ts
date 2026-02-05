import type { TestCase } from '../types/problem';
import ts from 'typescript';
import { classifyError, deepEqual, ErrorType } from '../lib/runnerUtils';

type RunMessage = {
  id: string;
  code: string;
  functionName: string;
  tests: TestCase[];
  language: 'ts' | 'js';
  inputFormat?: 'plain' | 'linked-list' | 'binary-tree';
  outputFormat?: 'plain' | 'linked-list' | 'binary-tree';
};

type RunResult = {
  id: string;
  ok: boolean;
  errorType?: ErrorType;
  results: {
    name: string;
    passed: boolean;
    expected: unknown;
    actual: unknown;
    input: unknown;
    error?: string;
  }[];
  logs: string[];
  error?: string;
};

const serialize = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};
const MAX_LOG_LINES = 50;
const MAX_LOG_CHARS = 2000;
const MAX_LOG_NOTICE = '[console output truncated]';

type ListNode = { val: number; next: ListNode | null };
type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };

const buildList = (values: number[]): ListNode | null => {
  let head: ListNode | null = null;
  let tail: ListNode | null = null;
  for (const val of values) {
    const node: ListNode = { val, next: null };
    if (!head) {
      head = node;
      tail = node;
    } else {
      tail!.next = node;
      tail = node;
    }
  }
  return head;
};

const listToArray = (head: ListNode | null) => {
  const result: number[] = [];
  let curr = head;
  while (curr) {
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
};

const buildTree = (values: Array<number | null>): TreeNode | null => {
  if (values.length === 0 || values[0] == null) return null;
  const root: TreeNode = { val: values[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift() as TreeNode;
    const leftVal = values[i++];
    if (leftVal != null) {
      node.left = { val: leftVal, left: null, right: null };
      queue.push(node.left);
    }
    const rightVal = values[i++];
    if (rightVal != null) {
      node.right = { val: rightVal, left: null, right: null };
      queue.push(node.right);
    }
  }
  return root;
};

const prepareArgs = (args: unknown[], inputFormat: 'plain' | 'linked-list' | 'binary-tree') => {
  if (inputFormat === 'linked-list') {
    return args.map((arg) => buildList(arg as number[]));
  }
  if (inputFormat === 'binary-tree') {
    return args.map((arg) => buildTree(arg as Array<number | null>));
  }
  return args;
};

const normalizeOutput = (
  output: unknown,
  outputFormat: 'plain' | 'linked-list' | 'binary-tree'
) => {
  if (outputFormat === 'linked-list') {
    return listToArray(output as ListNode | null);
  }
  if (outputFormat === 'binary-tree') {
    return output;
  }
  return output;
};

const normalizeExpected = (
  expected: unknown,
  outputFormat: 'plain' | 'linked-list' | 'binary-tree'
) => {
  if (outputFormat === 'linked-list') {
    return expected as number[];
  }
  if (outputFormat === 'binary-tree') {
    return expected as Array<number | null>;
  }
  return expected;
};

self.onmessage = (event: MessageEvent<RunMessage>) => {
  const { id, code, functionName, tests, language, inputFormat = 'plain', outputFormat = 'plain' } = event.data;
  const logs: string[] = [];

  const originalConsole = { ...console };
  console.log = (...args: unknown[]) => {
    if (logs.length >= MAX_LOG_LINES) {
      if (logs[logs.length - 1] !== MAX_LOG_NOTICE) {
        logs.push(MAX_LOG_NOTICE);
      }
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

  try {
    (self as any).importScripts = undefined;
    (self as any).fetch = undefined;
    (self as any).XMLHttpRequest = undefined;
    (self as any).WebSocket = undefined;
    (self as any).navigator = undefined;
    (self as any).location = undefined;
    if (!(self as any).process) {
      (self as any).process = { env: { NODE_ENV: 'production' }, versions: {} };
    }
    if (!(self as any).process.versions) {
      (self as any).process.versions = {};
    }
    if (!(self as any).process.versions.pnp) {
      (self as any).process.versions.pnp = '0';
    }

    const jsCode =
      language === 'ts'
        ? ts.transpileModule(code, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
          }).outputText
        : code;

    const sandboxHeader = [
      '"use strict";',
      'const window = undefined;',
      'const document = undefined;',
      'const globalThis = undefined;',
      'const self = undefined;',
      'const postMessage = undefined;',
      'const Function = undefined;',
      'const eval = undefined;',
      'const importScripts = undefined;',
      'const fetch = undefined;',
      'const XMLHttpRequest = undefined;',
      'const WebSocket = undefined;',
      'const navigator = undefined;',
      'const location = undefined;'
    ].join('\n');

    const userFn = new Function(
      `${sandboxHeader}\n${jsCode}\nreturn typeof ${functionName} === 'function' ? ${functionName} : undefined;`
    )();

    if (typeof userFn !== 'function') {
      const error: Error & { type?: ErrorType } = new Error(
        `Function \"${functionName}\" was not found. Make sure it is declared as a function.`
      );
      error.type = 'HARNESS_ERROR';
      throw error;
    }

    const results = tests.map((test) => {
      let args: unknown[];
      let expected: unknown;
      try {
        args = JSON.parse(test.input) as unknown[];
        expected = JSON.parse(test.expected) as unknown;
      } catch (error) {
        const harnessError: Error & { type?: ErrorType } = new Error(
          `Failed to parse test input/expected for ${test.name}`
        );
        harnessError.type = 'HARNESS_ERROR';
        throw harnessError;
      }
      const preparedArgs = prepareArgs(args, inputFormat);
      let actual: unknown;
      let errorMessage: string | undefined;
      try {
        const actualRaw = userFn(...preparedArgs);
        actual = normalizeOutput(actualRaw, outputFormat);
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : String(error);
        actual = undefined;
      }
      const expectedNormalized = normalizeExpected(expected, outputFormat);
      const passed = errorMessage ? false : deepEqual(actual, expectedNormalized);
      return {
        name: test.name,
        passed,
        expected: expectedNormalized,
        actual,
        input: args,
        error: errorMessage
      };
    });

    const ok = results.every((result) => result.passed);

    const payload: RunResult = {
      id,
      ok,
      results,
      logs
    };
    self.postMessage(payload);
  } catch (error) {
    const errorType: ErrorType =
      (error as Error & { type?: ErrorType }).type ?? classifyError(error);
    const payload: RunResult = {
      id,
      ok: false,
      errorType,
      results: [],
      logs,
      error: error instanceof Error ? error.message : String(error)
    };
    self.postMessage(payload);
  } finally {
    console.log = originalConsole.log;
  }
};
