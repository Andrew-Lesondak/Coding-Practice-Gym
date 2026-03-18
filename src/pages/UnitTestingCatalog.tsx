import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnitTestingProblems } from '../lib/useUnitTestingProblems';
import { getUnitTestingProgress, useAppStore } from '../store/useAppStore';

const UnitTestingCatalog = () => {
  const problems = useUnitTestingProblems();
  const progress = useAppStore((state) => state.progress);
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [framework, setFramework] = useState('all');
  const [status, setStatus] = useState('all');

  const topics = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.topics))).sort(), [problems]);

  const filtered = problems.filter((problem) => {
    const entry = getUnitTestingProgress(progress, problem.id);
    const solved = entry.passes > 0;
    const inProgress = entry.attempts > 0 && !solved;
    if (topic !== 'all' && !problem.topics.includes(topic)) return false;
    if (difficulty !== 'all' && problem.difficulty !== difficulty) return false;
    if (framework !== 'all' && problem.framework !== framework) return false;
    if (status === 'completed' && !solved) return false;
    if (status === 'in-progress' && !inProgress) return false;
    if (status === 'not-started' && entry.attempts > 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">Unit Testing Catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Filter by difficulty, topic, framework, and progress status.</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <label className="flex flex-col gap-2">
            Topic
            <select aria-label="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-mist-100">
              <option value="all">All</option>
              {topics.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Difficulty
            <select aria-label="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-mist-100">
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Framework
            <select aria-label="framework" value={framework} onChange={(event) => setFramework(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-mist-100">
              <option value="all">All</option>
              <option value="vitest">Vitest</option>
              <option value="vitest-testing-library">Vitest + Testing Library</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Status
            <select aria-label="status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-mist-100">
              <option value="all">All</option>
              <option value="not-started">Not started</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((problem) => {
          const entry = getUnitTestingProgress(progress, problem.id);
          return (
            <Link key={problem.id} to={`/unit-testing/${problem.id}`} className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-mist-300">{problem.difficulty}</p>
              <h3 className="mt-2 font-display text-lg">{problem.title}</h3>
              <p className="mt-2 text-xs text-mist-300">{problem.category} · {problem.framework}</p>
              <p className="mt-2 text-xs text-mist-300">{problem.topics.join(', ')}</p>
              <p className="mt-3 text-xs text-mist-400">Attempts: {entry.attempts} · Passes: {entry.passes}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default UnitTestingCatalog;
