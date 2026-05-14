import { DataStructureRunResult } from '../lib/dataStructureRunner';

const DataStructureResults = ({ result }: { result?: DataStructureRunResult }) => {
  if (!result) {
    return <p className="text-sm text-mist-300">Run the tests to see visible results here.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {result.error && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-rose-200">
          <p className="font-semibold">{result.errorType ?? 'Error'}</p>
          <p className="mt-1">{result.error}</p>
        </div>
      )}

      {result.results.length > 0 && (
        <div className="space-y-2">
          {result.results.map((test) => (
            <div
              key={test.name}
              className={`rounded-xl border p-3 ${
                test.passed ? 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200' : 'border-rose-400/20 bg-rose-500/5 text-rose-200'
              }`}
            >
              <p className="font-medium">{test.name}</p>
              {!test.passed && test.error && <p className="mt-1 text-xs">{test.error}</p>}
            </div>
          ))}
        </div>
      )}

      {result.logs.length > 0 && (
        <div className="rounded-xl border border-white/10 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Console output</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-mist-200">{result.logs.join('\n')}</pre>
        </div>
      )}
    </div>
  );
};

export default DataStructureResults;
