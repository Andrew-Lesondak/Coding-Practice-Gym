import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReactCodingProblems } from '../lib/useReactCodingProblems';
import { useAppStore, getReactCodingProgress } from '../store/useAppStore';

const ReactCodingCatalog = () => {
  const problems = useReactCodingProblems();
  const progress = useAppStore((state) => state.progress);
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const topics = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((problem) => problem.topics.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [problems]);

  const filtered = problems.filter((problem) => {
    if (topic !== 'all' && !problem.topics.includes(topic)) return false;
    if (difficulty !== 'all' && problem.difficulty !== difficulty) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">React Coding Catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Filter by topic and difficulty.</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <label className="flex flex-col gap-2">
            Topic
            <select
              aria-label="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-mist-100"
            >
              <option value="all">All</option>
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Difficulty
            <select
              aria-label="difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-mist-100"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((problem) => {
          const entry = getReactCodingProgress(progress, problem.id);
          return (
            <Link key={problem.id} to={`/react/${problem.id}`} className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-mist-300">{problem.difficulty}</p>
              <h3 className="mt-2 font-display text-lg">{problem.title}</h3>
              <p className="mt-2 text-xs text-mist-300">{problem.topics.join(', ')}</p>
              <p className="mt-3 text-xs">
                <span className="text-amber-300">Attempts: {entry.attempts}</span>
                <span className="mx-2 text-mist-500">·</span>
                <span className="text-emerald-300">Passes: {entry.passes}</span>
              </p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default ReactCodingCatalog;
