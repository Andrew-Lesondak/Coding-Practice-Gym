export type ErrorType =
  | 'SYNTAX_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'HARNESS_ERROR'
  | 'TEST_FAILURE'
  | 'WEAK_TEST_FAILURE'
  | 'MODULE_RESOLUTION_ERROR';

type AnyRecord = Record<string, unknown>;

export const stableStringify = (value: unknown): string => {
  const seen = new Set<unknown>();

  const normalizeNumber = (num: number) => {
    if (Number.isNaN(num)) return 'NaN';
    if (Object.is(num, -0)) return '0';
    return String(num);
  };

  const helper = (input: unknown): string => {
    if (input === null) return 'null';
    if (input === undefined) return 'undefined';
    if (typeof input === 'number') return normalizeNumber(input);
    if (typeof input === 'bigint') return `${input.toString()}n`;
    if (typeof input === 'string') return JSON.stringify(input);
    if (typeof input === 'boolean') return input ? 'true' : 'false';
    if (typeof input === 'function') return '"[Function]"';
    if (typeof input === 'symbol') return '"[Symbol]"';

    if (seen.has(input)) {
      return '"[Circular]"';
    }
    seen.add(input);

    if (Array.isArray(input)) {
      const items = input.map((item) => helper(item)).join(',');
      return `[${items}]`;
    }

    const obj = input as AnyRecord;
    const keys = Object.keys(obj).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${helper(obj[key])}`).join(',');
    return `{${entries}}`;
  };

  return helper(value);
};

export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    if (Object.is(a, -0) && Object.is(b, 0)) return true;
    if (Object.is(a, 0) && Object.is(b, -0)) return true;
  }
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as AnyRecord;
    const bObj = b as AnyRecord;
    const aKeys = Object.keys(aObj).sort();
    const bKeys = Object.keys(bObj).sort();
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key, index) => key === bKeys[index] && deepEqual(aObj[key], bObj[key]));
  }

  return false;
};

export const classifyError = (error: unknown): ErrorType => {
  if (error instanceof SyntaxError) return 'SYNTAX_ERROR';
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Cannot resolve module')) return 'MODULE_RESOLUTION_ERROR';
  return 'RUNTIME_ERROR';
};
