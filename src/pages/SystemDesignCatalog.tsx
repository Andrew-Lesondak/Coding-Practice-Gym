import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import { useSystemDesignPrompts } from '../lib/useSystemDesignPrompts';
import { useAppStore, getSystemDesignProgress } from '../store/useAppStore';

const difficultyOptions = ['All', 'easy', 'medium', 'hard'];

const SystemDesignCatalog = () => {
  const prompts = useSystemDesignPrompts();
  const progress = useAppStore((state) => state.progress);
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dueOnly, setDueOnly] = useState(false);

  const domains = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((prompt) => set.add(prompt.domain));
    return ['All', ...Array.from(set).sort()];
  }, [prompts]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    prompts.forEach((prompt) => prompt.tags.forEach((tag) => set.add(tag)));
    return ['All', ...Array.from(set).sort()];
  }, [prompts]);

  const filtered = useMemo(() => {
    return prompts.filter((prompt) => {
      const prog = getSystemDesignProgress(progress, prompt.id);
      const due = prog.nextReviewAt ? new Date(prog.nextReviewAt) <= new Date() : false;
      const status = prog.passes > 0 ? 'Completed' : prog.attempts > 0 ? 'In progress' : 'Not started';
      const difficultyOk = difficultyFilter === 'All' || prompt.difficulty === difficultyFilter;
      const domainOk = domainFilter === 'All' || prompt.domain === domainFilter;
      const tagOk = tagFilter === 'All' || prompt.tags.includes(tagFilter);
      const statusOk = statusFilter === 'All' || status === statusFilter;
      const dueOk = !dueOnly || due;
      return difficultyOk && domainOk && tagOk && statusOk && dueOk;
    });
  }, [prompts, progress, difficultyFilter, domainFilter, tagFilter, statusFilter, dueOnly]);

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-6">
        <h1 className="font-display text-2xl font-semibold">System design catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Filter prompts by difficulty, domain, tags, and review status.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <FilterBar
            title="Difficulty"
            options={difficultyOptions.map((difficulty) => ({ label: difficulty, value: difficulty }))}
            active={difficultyFilter}
            onChange={setDifficultyFilter}
          />
          <FilterBar
            title="Domain"
            options={domains.map((domain) => ({ label: domain, value: domain }))}
            active={domainFilter}
            onChange={setDomainFilter}
          />
          <FilterBar
            title="Tag"
            options={tags.map((tag) => ({ label: tag, value: tag }))}
            active={tagFilter}
            onChange={setTagFilter}
          />
          <FilterBar
            title="Status"
            options={['All', 'Not started', 'In progress', 'Completed'].map((status) => ({ label: status, value: status }))}
            active={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-mist-200">
          <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} />
          <span>Due for review only</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((prompt) => {
          const prog = getSystemDesignProgress(progress, prompt.id);
          const hasExplanation = Boolean(prog.explanation);
          return (
            <Link key={prompt.id} to={`/system-design/${prompt.id}`} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{prompt.title}</p>
                  <p className="text-xs text-mist-300">{prompt.domain} • {prompt.tags.join(', ')}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-mist-200">{prompt.difficulty}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-mist-300">
                <span>{prog.passes > 0 ? 'Completed' : prog.attempts > 0 ? 'In progress' : 'Not started'}</span>
                <span>{prog.attempts} attempts</span>
              </div>
              <div className="mt-3">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                    hasExplanation ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-mist-300'
                  }`}
                >
                  {hasExplanation ? 'Has explanation' : 'Missing explanation'}
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default SystemDesignCatalog;
