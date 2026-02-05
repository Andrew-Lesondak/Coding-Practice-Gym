import type { TestCase } from '../types/problem';
import ts from 'typescript';

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
  results: {
    name: string;
    passed: boolean;
    expected: unknown;
    actual: unknown;
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

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    return aKeys.every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
  }
  return false;
};

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
    logs.push(args.map(serialize).join(' '));
  };

  try {
    if (!(self as any).process) {
      (self as any).process = { env: { NODE_ENV: 'production' }, versions: {} };
    }
    if (!(self as any).process.versions) {
      (self as any).process.versions = {};
    }
    if (!(self as any).process.versions.pnp) {
      (self as any).process.versions.pnp = '0';
    }
    (self as any).fetch = undefined;
    (self as any).XMLHttpRequest = undefined;

    const jsCode =
      language === 'ts'
        ? ts.transpileModule(code, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
          }).outputText
        : code;

    const userFn = new Function(
      `"use strict";\n${jsCode}\nreturn typeof ${functionName} === 'function' ? ${functionName} : undefined;`
    )();

    if (typeof userFn !== 'function') {
      throw new Error(`Function \"${functionName}\" was not found. Make sure it is declared as a function.`);
    }

    const results = tests.map((test) => {
      const args = JSON.parse(test.input) as unknown[];
      const expected = JSON.parse(test.expected) as unknown;
      const preparedArgs = prepareArgs(args, inputFormat);
      const actualRaw = userFn(...preparedArgs);
      const actual = normalizeOutput(actualRaw, outputFormat);
      const expectedNormalized = normalizeExpected(expected, outputFormat);
      const passed = deepEqual(actual, expectedNormalized);
      return {
        name: test.name,
        passed,
        expected: expectedNormalized,
        actual
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
    const payload: RunResult = {
      id,
      ok: false,
      results: [],
      logs,
      error: error instanceof Error ? error.message : String(error)
    };
    self.postMessage(payload);
  } finally {
    console.log = originalConsole.log;
  }
};
