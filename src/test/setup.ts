import React from 'react';
import { expect, vi, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

const activeIntervals = new Set<number>();
const activeTimeouts = new Set<number>();
const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;
const originalSetTimeout = window.setTimeout;
const originalClearTimeout = window.clearTimeout;

window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
  const id = originalSetInterval(handler, timeout, ...args) as unknown as number;
  activeIntervals.add(id);
  return id;
}) as typeof window.setInterval;

window.clearInterval = ((id?: number) => {
  if (typeof id === 'number') {
    activeIntervals.delete(id);
  }
  return originalClearInterval(id as number);
}) as typeof window.clearInterval;

window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: any[]) => {
  const id = originalSetTimeout(handler, timeout, ...args) as unknown as number;
  activeTimeouts.add(id);
  return id;
}) as typeof window.setTimeout;

window.clearTimeout = ((id?: number) => {
  if (typeof id === 'number') {
    activeTimeouts.delete(id);
  }
  return originalClearTimeout(id as number);
}) as typeof window.clearTimeout;

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.resetAllMocks();
  activeIntervals.forEach((id) => originalClearInterval(id));
  activeIntervals.clear();
  activeTimeouts.forEach((id) => originalClearTimeout(id));
  activeTimeouts.clear();
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
