import DataStructureRunnerWorker from '../workers/dataStructureRunner.worker?worker';
import { executeDataStructureTests } from './dataStructureExecutor';
import { ErrorType } from './runnerUtils';
import { DataStructureProblem } from '../types/dataStructures';

const DEFAULT_DATA_STRUCTURE_TIMEOUT_MS = 1500;

export type DataStructureRunResult = {
  ok: boolean;
  results: { name: string; passed: boolean; error?: string }[];
  logs: string[];
  error?: string;
  errorType?: ErrorType;
  timedOut?: boolean;
};

const runWorker = ({
  code,
  testCode,
  timeoutMs = DEFAULT_DATA_STRUCTURE_TIMEOUT_MS
}: {
  code: string;
  testCode: string;
  timeoutMs?: number;
}): Promise<DataStructureRunResult> => {
  if (import.meta.env.MODE === 'test') {
    return executeDataStructureTests({ code, testCode });
  }

  return new Promise((resolve) => {
    const worker = new DataStructureRunnerWorker();
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
      if (event.data?.id !== id) return;
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

    worker.postMessage({ id, code, testCode });
  });
};

export const runDataStructureTests = ({
  problem,
  code,
  timeoutMs = DEFAULT_DATA_STRUCTURE_TIMEOUT_MS
}: {
  problem: DataStructureProblem;
  code: string;
  timeoutMs?: number;
}) => runWorker({ code, testCode: problem.tests.visible, timeoutMs });

export const submitDataStructureSolution = async ({
  problem,
  code,
  timeoutMs = DEFAULT_DATA_STRUCTURE_TIMEOUT_MS
}: {
  problem: DataStructureProblem;
  code: string;
  timeoutMs?: number;
}): Promise<DataStructureRunResult> => {
  const visible = await runWorker({ code, testCode: problem.tests.visible, timeoutMs });
  if (!visible.ok) return visible;

  const hidden = await runWorker({ code, testCode: problem.tests.hidden, timeoutMs });
  if (!hidden.ok) return hidden;

  return {
    ok: true,
    results: [...visible.results, ...hidden.results],
    logs: [...visible.logs, ...hidden.logs]
  };
};

export const formatExpectedComplexity = (
  complexity: DataStructureProblem['metadata']['expectedComplexities'][number]
) => {
  return `${complexity.operation}: ${complexity.time}${complexity.space ? ` / ${complexity.space}` : ''}`;
};
