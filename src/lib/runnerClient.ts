import type { TestCase } from '../types/problem';
import RunnerWorker from '../workers/runner.worker?worker';

export type RunPayload = {
  code: string;
  functionName: string;
  tests: TestCase[];
  language: 'ts' | 'js';
  inputFormat?: 'plain' | 'linked-list' | 'binary-tree';
  outputFormat?: 'plain' | 'linked-list' | 'binary-tree';
};

export type RunResponse = {
  ok: boolean;
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
  timedOut?: boolean;
  errorType?: 'SYNTAX_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'HARNESS_ERROR';
};

export const runInWorker = (payload: RunPayload, timeoutMs = 1000): Promise<RunResponse> => {
  return new Promise((resolve) => {
    const worker = new RunnerWorker();
    const id = crypto.randomUUID();

    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        ok: false,
        results: [],
        logs: [],
        timedOut: true,
        error: 'Execution timed out.',
        errorType: 'TIMEOUT'
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent) => {
      if (event.data?.id !== id) {
        return;
      }
      clearTimeout(timer);
      worker.terminate();
      resolve({
        ok: event.data.ok,
        results: event.data.results,
        logs: event.data.logs,
        error: event.data.error,
        errorType: event.data.errorType
      });
    };

    worker.postMessage({ ...payload, id });
  });
};
