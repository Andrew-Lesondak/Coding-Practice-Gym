import { Link } from 'react-router-dom';
import { useUnitTestingProblems } from '../lib/useUnitTestingProblems';
import { getUnitTestingProgress, useAppStore } from '../store/useAppStore';

const UnitTestingDashboard = () => {
  const problems = useUnitTestingProblems();
  const progress = useAppStore((state) => state.progress);

  const due = problems.filter((problem) => {
    const entry = getUnitTestingProgress(progress, problem.id);
    return entry.nextReviewAt && new Date(entry.nextReviewAt) <= new Date();
  });

  const inProgress = problems.filter((problem) => {
    const entry = getUnitTestingProgress(progress, problem.id);
    return entry.attempts > 0 && entry.passes === 0;
  });

  const weakTopics = Array.from(
    new Set(
      problems
        .filter((problem) => {
          const entry = getUnitTestingProgress(progress, problem.id);
          return entry.attempts > 0 && entry.passes === 0;
        })
        .flatMap((problem) => problem.topics)
    )
  ).slice(0, 6);

  const quickStart = problems.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">Unit Testing Gym</h1>
        <p className="mt-2 text-sm text-mist-200">Practice writing meaningful tests against existing code with guided steps, runnable feedback, and mutant-based verification.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950" to="/unit-testing/catalog">Browse problems</Link>
          {quickStart[0] && <Link className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200" to={`/unit-testing/${quickStart[0].id}`}>Quick start</Link>}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Due for review</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {due.length === 0 && <p className="text-mist-400">No reviews due.</p>}
            {due.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/unit-testing/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Continue</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {inProgress.length === 0 && <p className="text-mist-400">No in-progress test-writing problems.</p>}
            {inProgress.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/unit-testing/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Weak topics</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-mist-200">
            {weakTopics.length === 0 && <p className="text-sm text-mist-400">No weak topics yet.</p>}
            {weakTopics.map((topic) => (
              <span key={topic} className="rounded-full border border-white/10 px-3 py-1">{topic}</span>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg">Quick start</h3>
          <div className="mt-3 space-y-2 text-sm text-mist-200">
            {quickStart.map((problem) => (
              <Link key={problem.id} className="block rounded-xl border border-white/10 p-3" to={`/unit-testing/${problem.id}`}>
                {problem.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UnitTestingDashboard;
