import clsx from 'clsx';
import { DebuggingResult, PreviewResult } from '../lib/reactDebuggingRunner';

const DebuggingRunResult = ({
  result,
  preview
}: {
  result?: DebuggingResult;
  preview?: PreviewResult;
}) => {
  return (
    <div className="space-y-3">
      {preview && !preview.ok && <p className="text-sm text-rose-300">{preview.error}</p>}
      {result?.error && <p className="text-sm text-rose-300">{result.error}</p>}
      {result?.results.map((item) => (
        <div key={item.name} className="rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{item.name}</p>
            <span className={clsx('text-xs', item.passed ? 'text-emerald-300' : 'text-rose-300')}>
              {item.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          {item.error && <p className="mt-2 text-xs text-rose-300">{item.error}</p>}
        </div>
      ))}
      {((preview?.logs.length ?? 0) > 0 || (result?.logs.length ?? 0) > 0) && (
        <details className="rounded-xl border border-white/10 p-3 text-xs text-mist-200">
          <summary className="cursor-pointer font-semibold text-mist-100">Console output</summary>
          <div className="mt-2 space-y-1">
            {[...(preview?.logs ?? []), ...(result?.logs ?? [])].map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default DebuggingRunResult;
