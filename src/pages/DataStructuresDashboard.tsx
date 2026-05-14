import { Link } from 'react-router-dom';
import { useDataStructureProblems } from '../lib/useDataStructureProblems';
import { getDataStructureProgress, useAppStore } from '../store/useAppStore';

const DataStructuresDashboard = () => {
  const problems = useDataStructureProblems();
  const progress = useAppStore((state) => state.progress);

  const due = problems.filter((problem) => {
    const entry = getDataStructureProgress(progress, problem.id);
    return entry.nextReviewAt && new Date(entry.nextReviewAt) <= new Date();
  });

  const inProgress = problems.filter((problem) => {
    const entry = getDataStructureProgress(progress, problem.id);
    return entry.attempts > 0 && entry.passes === 0;
  });

  const weakStructures = Array.from(
    new Set(
      problems
        .filter((problem) => {
          const entry = getDataStructureProgress(progress, problem.id);
          return entry.attempts > 0 && entry.passes === 0;
        })
        .flatMap((problem) => problem.structures)
    )
  ).slice(0, 6);

  const weakOperations = Array.from(
    new Set(
      problems
        .filter((problem) => {
          const entry = getDataStructureProgress(progress, problem.id);
          return entry.attempts > 0 && entry.passes === 0;
        })
        .flatMap((problem) => problem.operations)
    )
  ).slice(0, 8);

  const recent = [...problems]
    .filter((problem) => Boolean(getDataStructureProgress(progress, problem.id).lastPassedAt))
    .sort((a, b) => {
      const aTime = new Date(getDataStructureProgress(progress, a.id).lastPassedAt ?? 0).getTime();
      const bTime = new Date(getDataStructureProgress(progress, b.id).lastPassedAt ?? 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 4);

  const recommended =
    due[0] ??
    problems.find((problem) => {
      const entry = getDataStructureProgress(progress, problem.id);
      return entry.attempts === 0;
    }) ??
    problems[0];

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">Data Structures Gym</h1>
        <p className="mt-2 text-sm text-mist-200">Practice implementing core structures from scratch with guided stubs, strict steps, and worker-backed tests.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" to="/data-structures/catalog">Browse structures</Link>
          {recommended && <Link className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" to={`/data-structures/${recommended.id}`}>Quick start</Link>}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Due for review</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {due.length === 0 && <p className="text-mist-400">No data structure reviews due.</p>}
            {due.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/data-structures/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Continue</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {inProgress.length === 0 && <p className="text-mist-400">No in-progress structure implementations.</p>}
            {inProgress.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/data-structures/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Weak structures</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-mist-200">
            {weakStructures.length === 0 && <p className="text-sm text-mist-400">No weak structures yet.</p>}
            {weakStructures.map((structure) => (
              <span key={structure} className="rounded-full border border-white/10 px-3 py-1">{structure}</span>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Operations needing practice</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-mist-200">
            {weakOperations.length === 0 && <p className="text-sm text-mist-400">No weak operations yet.</p>}
            {weakOperations.map((operation) => (
              <span key={operation} className="rounded-full border border-white/10 px-3 py-1">{operation}</span>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Recently passed</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {recent.length === 0 && <p className="text-mist-400">Nothing passed yet.</p>}
            {recent.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/data-structures/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataStructuresDashboard;
