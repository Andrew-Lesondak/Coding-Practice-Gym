import { Link } from 'react-router-dom';
import { useSystemDesignPrompts } from '../lib/useSystemDesignPrompts';
import { useAppStore } from '../store/useAppStore';
import { getSystemDesignContinue, getSystemDesignDue, getSystemDesignStats } from '../lib/systemDesignSelectors';

const SystemDesignDashboard = () => {
  const prompts = useSystemDesignPrompts();
  const progress = useAppStore((state) => state.progress);
  const due = getSystemDesignDue(prompts, progress);
  const continueList = getSystemDesignContinue(prompts, progress);
  const stats = getSystemDesignStats(prompts, progress);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">System Design Gym</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Practice reasoning, not just answers.</h1>
          <p className="mt-3 text-sm text-mist-200">
            Work through structured prompts, score yourself with rubrics, and reinforce decisions over time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/system-design/catalog"
              className="rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950"
            >
              Start a prompt
            </Link>
            <Link
              to="/system-design/catalog"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist-200"
            >
              Browse catalog
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
            You are caught up. Reviews appear after completing prompts.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {due.map((prompt) => (
              <Link
                key={prompt.id}
                to={`/system-design/${prompt.id}`}
                className="glass rounded-2xl p-5"
              >
                <p className="font-display text-lg font-semibold">{prompt.title}</p>
                <p className="text-xs text-mist-300">{prompt.domain} • {prompt.tags.join(', ')}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Continue practicing</h2>
          <span className="text-xs text-mist-300">{continueList.length} active</span>
        </div>
        {continueList.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-sm text-mist-300">
            No active prompts. Pick one from the catalog.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {continueList.map((prompt) => (
              <Link
                key={prompt.id}
                to={`/system-design/${prompt.id}`}
                className="glass rounded-2xl p-5"
              >
                <p className="font-display text-lg font-semibold">{prompt.title}</p>
                <p className="text-xs text-mist-300">{prompt.domain} • {prompt.tags.join(', ')}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SystemDesignDashboard;
