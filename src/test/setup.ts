import React from 'react';
import { expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.resetAllMocks();
  localStorage.clear();
});

class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  constructor() {}
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
}

if (!('Worker' in globalThis)) {
  // @ts-expect-error - test shim
  globalThis.Worker = MockWorker;
}

vi.mock('../lib/runnerClient', () => ({
  runInWorker: async () => ({ ok: true, results: [], logs: [] })
}));

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children)
}));

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val?: string) => void }) =>
    React.createElement('textarea', {
      value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)
    })
}));

vi.mock('../components/CodeEditor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) =>
    React.createElement('textarea', {
      value,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)
    })
}));

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' })
  }
}));
