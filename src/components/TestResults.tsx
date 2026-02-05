import clsx from 'clsx';
import { RunResponse } from '../lib/runnerClient';

const formatValue = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const TestResults = ({ result }: { result?: RunResponse }) => {
  if (!result) {
    return null;
  }

  if (result.timedOut) {
    return <p className="text-sm text-rose-300">Execution timed out after 1s.</p>;
  }

  return (
    <div className="space-y-3">
      {result.error && <p className="text-sm text-rose-300">{result.error}</p>}
      {result.results.map((item) => (
        <div key={item.name} className="rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{item.name}</p>
            <span className={clsx('text-xs', item.passed ? 'text-emerald-300' : 'text-rose-300')}>
              {item.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          {!item.passed && (
            <div className="mt-2 text-xs text-mist-200">
              <p>Expected: {formatValue(item.expected)}</p>
              <p>Actual: {formatValue(item.actual)}</p>
            </div>
          )}
        </div>
      ))}
      {result.logs.length > 0 && (
        <div className="rounded-xl border border-white/10 p-3 text-xs text-mist-200">
          <p className="font-semibold text-mist-100">Console</p>
          {result.logs.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestResults;
