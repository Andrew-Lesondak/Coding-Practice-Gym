import { Link } from 'react-router-dom';
import { dsaDrills } from '../data/dsaDrills';
import { problems } from '../data/problems';
import { useAppStore } from '../store/useAppStore';

const DSADrillsDashboard = () => {
  const attempts = useAppStore((state) => state.drillAttempts);
  const patternScores: Record<string, number[]> = {};
  attempts.forEach((attempt) => {
    const problem = problems.find((p) => p.id === attempt.problemId);
    problem?.patterns.forEach((pattern) => {
      patternScores[pattern] = patternScores[pattern] ?? [];
      patternScores[pattern].push(attempt.passed ? 1 : 0);
    });
  });
  const weakPatterns = Object.entries(patternScores)
    .map(([pattern, scores]) => ({ pattern, score: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const typeScores: Record<string, number[]> = {};
  attempts.forEach((attempt) => {
    typeScores[attempt.drillType] = typeScores[attempt.drillType] ?? [];
    typeScores[attempt.drillType].push(attempt.durationSeconds);
  });
  const slowestTypes = Object.entries(typeScores)
    .map(([type, durations]) => ({ type, avg: durations.reduce((a, b) => a + b, 0) / durations.length }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);
  const redo = dsaDrills.find((drill) => attempts.some((attempt) => attempt.drillId === drill.id)) ?? dsaDrills[0];

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">DSA Speed Drills</h1>
        <p className="mt-2 text-sm text-mist-200">Short, focused drills to build recall and speed.</p>
        {redo && (
          <div className="mt-4">
            <Link className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950" to={`/dsa/drills/${redo.id}`}>
              Redo similar drill
            </Link>
          </div>
        )}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg">Weak patterns</h2>
          {weakPatterns.length === 0 ? (
            <p className="mt-2 text-sm text-mist-300">Not enough data yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-mist-200">
              {weakPatterns.map((item) => (
                <li key={item.pattern}>{item.pattern} — {Math.round(item.score * 100)}%</li>
              ))}
            </ul>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg">Slowest drill types</h2>
          {slowestTypes.length === 0 ? (
            <p className="mt-2 text-sm text-mist-300">Not enough data yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-mist-200">
              {slowestTypes.map((item) => (
                <li key={item.type}>{item.type} — {Math.round(item.avg)}s avg</li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {dsaDrills.map((drill) => (
          <Link key={drill.id} to={`/dsa/drills/${drill.id}`} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold">{drill.id}</p>
                <p className="text-xs text-mist-300">{drill.drillType} • {drill.difficulty}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-mist-200">
                {drill.timeLimitMinutes} min
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default DSADrillsDashboard;
