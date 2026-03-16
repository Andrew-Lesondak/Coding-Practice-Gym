import { Link } from 'react-router-dom';
import { useReactDebuggingProblems } from '../lib/useReactDebuggingProblems';
import { getReactDebuggingProgress, useAppStore } from '../store/useAppStore';

const ReactDebuggingDashboard = () => {
  const problems = useReactDebuggingProblems();
  const progress = useAppStore((state) => state.progress);

  const due = problems.filter((problem) => {
    const entry = getReactDebuggingProgress(progress, problem.id);
    return entry.nextReviewAt && new Date(entry.nextReviewAt) <= new Date();
  });
  const inProgress = problems.filter((problem) => {
    const entry = getReactDebuggingProgress(progress, problem.id);
    return entry.attempts > 0 && entry.passes === 0;
  });
  const weakAreas = Array.from(
    problems.reduce((map, problem) => {
      const entry = getReactDebuggingProgress(progress, problem.id);
      problem.bugTypes.forEach((bugType) => {
        const current = map.get(bugType) ?? { attempts: 0, passes: 0 };
        current.attempts += entry.attempts;
        current.passes += entry.passes;
        map.set(bugType, current);
      });
      return map;
    }, new Map<string, { attempts: number; passes: number }>())
  )
    .filter(([, stats]) => stats.attempts > 0)
    .sort((a, b) => a[1].passes / Math.max(a[1].attempts, 1) - b[1].passes / Math.max(b[1].attempts, 1))
    .slice(0, 4);

  const quickStart = problems[0];

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">React Debugging Gym</h1>
        <p className="mt-2 text-sm text-mist-200">
          Debug realistic React bugs inside small multi-file codebases, then lock in the root cause.
        </p>
        <div className="mt-4 flex gap-3">
          <Link className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" to="/react-debugging/catalog">
            Browse challenges
          </Link>
          {quickStart && (
            <Link className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" to={`/react-debugging/${quickStart.id}`}>
              Quick start
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Due for review</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {due.length === 0 ? <p className="text-mist-400">No debugging reviews due.</p> : due.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/react-debugging/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Continue debugging</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {inProgress.length === 0 ? <p className="text-mist-400">No active debugging sessions.</p> : inProgress.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/react-debugging/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Weak areas</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {weakAreas.length === 0 ? <p className="text-mist-400">Solve a few challenges to surface patterns.</p> : weakAreas.map(([bugType, stats]) => (
              <div key={bugType} className="rounded-xl border border-white/10 p-3">
                {bugType} · {stats.passes}/{stats.attempts} passed
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Quick start</h3>
          {quickStart ? (
            <Link className="mt-3 block rounded-xl border border-white/10 p-4 text-sm text-mist-200" to={`/react-debugging/${quickStart.id}`}>
              <p className="font-semibold text-mist-50">{quickStart.title}</p>
              <p className="mt-2 text-xs text-mist-300">{quickStart.bugTypes.join(', ')}</p>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-mist-400">No challenges found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ReactDebuggingDashboard;
