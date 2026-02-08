import { Link } from 'react-router-dom';
import { useReactCodingProblems } from '../lib/useReactCodingProblems';
import { useAppStore, getReactCodingProgress } from '../store/useAppStore';

const ReactCodingDashboard = () => {
  const problems = useReactCodingProblems();
  const progress = useAppStore((state) => state.progress);

  const due = problems.filter((problem) => {
    const entry = getReactCodingProgress(progress, problem.id);
    return entry.nextReviewAt && new Date(entry.nextReviewAt) <= new Date();
  });

  const inProgress = problems.filter((problem) => {
    const entry = getReactCodingProgress(progress, problem.id);
    return entry.attempts > 0 && entry.passes === 0;
  });

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">React Coding Gym</h1>
        <p className="mt-2 text-sm text-mist-200">Practice React component logic with guided steps and tests.</p>
        <div className="mt-4 flex gap-3">
          <Link className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" to="/react/catalog">
            Browse problems
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Due for review</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {due.length === 0 && <p className="text-mist-400">No reviews due.</p>}
            {due.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/react/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Continue</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {inProgress.length === 0 && <p className="text-mist-400">No in-progress problems.</p>}
            {inProgress.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/react/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReactCodingDashboard;
