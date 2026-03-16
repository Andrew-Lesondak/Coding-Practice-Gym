import { Link } from 'react-router-dom';
import { useProblems } from '../lib/useProblems';
import { useAppStore } from '../store/useAppStore';
import ProblemCard from '../components/ProblemCard';
import { getContinueSolving, getDueReviews, getStats } from '../lib/progressSelectors';

const Dashboard = () => {
  const progress = useAppStore((state) => state.progress);
  const problems = useProblems();
  const due = getDueReviews(problems, progress);
  const continueList = getContinueSolving(problems, progress);
  const stats = getStats(problems, progress);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Focus now</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Train like it’s interview day.</h1>
          <p className="mt-3 text-sm text-mist-200">
            Guided completion, pattern tagging, and spaced repetition keep you sharp and consistent.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/catalog" className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950">
              Start a problem
            </Link>
            <Link to="/react-debugging" className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist-200">
              Debug React
            </Link>
            <Link to="/catalog" className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist-200">
              Review catalog
            </Link>
          </div>
        </div>
        <div className="code-panel rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">Your stats</p>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs text-mist-300">Completed</p>
              <p className="text-2xl font-semibold">{stats.completed}</p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs text-mist-300">In progress</p>
              <p className="text-2xl font-semibold">{stats.started - stats.completed}</p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs text-mist-300">Total attempts</p>
              <p className="text-2xl font-semibold">{stats.attempts}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Due for review</h2>
          <span className="text-xs text-mist-300">{due.length} due</span>
        </div>
        {due.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-sm text-mist-300">
            You are all caught up. New reviews appear after you pass problems.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {due.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} progress={progress.problems[problem.id]} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Continue solving</h2>
          <span className="text-xs text-mist-300">{continueList.length} active</span>
        </div>
        {continueList.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-sm text-mist-300">
            No active problems. Pick one from the catalog to begin.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {continueList.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} progress={progress.problems[problem.id]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
