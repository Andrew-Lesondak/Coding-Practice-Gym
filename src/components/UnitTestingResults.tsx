import clsx from 'clsx';
import { UnitTestingRunResult } from '../lib/unitTestingRunner';

const UnitTestingResults = ({ result }: { result?: UnitTestingRunResult }) => {
  if (!result) {
    return <p className="text-sm text-mist-300">Run tests to see failures, console output, and hidden verification feedback.</p>;
  }

  return (
    <div className="space-y-3">
      {result.error && (
        <div className={clsx('rounded-xl border p-3 text-sm', result.errorType === 'WEAK_TEST_FAILURE' ? 'border-amber-400/30 text-amber-200' : 'border-rose-400/30 text-rose-200')}>
          <p>{result.error}</p>
          {result.errorType === 'WEAK_TEST_FAILURE' && (
            <p className="mt-2 text-xs text-amber-100">
              Your tests passed the main implementation, but at least one hidden bug variant still slipped through. Strengthen the assertions so they prove the intended behavior.
            </p>
          )}
        </div>
      )}
      {result.results.map((item) => (
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
      {result.weakMutants && result.weakMutants.length > 0 && (
        <div className="rounded-xl border border-amber-400/30 p-3 text-xs text-amber-100">
          <p className="font-semibold">Hidden mutants still survived</p>
          <ul className="mt-2 space-y-1">
            {result.weakMutants.map((mutant) => (
              <li key={mutant.id}>
                {mutant.id}{mutant.description ? `: ${mutant.description}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.logs.length > 0 && (
        <details className="rounded-xl border border-white/10 p-3 text-xs text-mist-200">
          <summary className="cursor-pointer font-semibold text-mist-100">Console output</summary>
          <div className="mt-2 space-y-1">
            {result.logs.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default UnitTestingResults;
