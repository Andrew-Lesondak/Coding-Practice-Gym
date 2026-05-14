import { executeDataStructureTests } from '../lib/dataStructureExecutor';
import { ErrorType } from '../lib/runnerUtils';

type RunMessage = {
  id: string;
  code: string;
  testCode: string;
};

type RunResult = {
  id: string;
  ok: boolean;
  results: { name: string; passed: boolean; error?: string }[];
  logs: string[];
  error?: string;
  errorType?: ErrorType;
};

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const { id, code, testCode } = event.data;

  try {
    const result = await executeDataStructureTests({ code, testCode });
    const payload: RunResult = {
      id,
      ...result
    };
    self.postMessage(payload);
  } catch (error) {
    const payload: RunResult = {
      id,
      ok: false,
      results: [],
      logs: [],
      error: error instanceof Error ? error.message : String(error),
      errorType: (error as Error & { type?: ErrorType }).type ?? 'RUNTIME_ERROR'
    };
    self.postMessage(payload);
  }
};
