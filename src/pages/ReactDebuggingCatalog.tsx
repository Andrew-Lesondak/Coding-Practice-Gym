import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReactDebuggingProblems } from '../lib/useReactDebuggingProblems';
import { getReactDebuggingProgress, useAppStore } from '../store/useAppStore';

const ReactDebuggingCatalog = () => {
  const problems = useReactDebuggingProblems();
  const progress = useAppStore((state) => state.progress);
  const [difficulty, setDifficulty] = useState('all');
  const [bugType, setBugType] = useState('all');
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState('all');

  const topics = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.topics))).sort(), [problems]);
  const bugTypes = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.bugTypes))).sort(), [problems]);

  const filtered = problems.filter((problem) => {
    const entry = getReactDebuggingProgress(progress, problem.id);
    const derivedStatus = entry.passes > 0 ? 'passed' : entry.attempts > 0 ? 'in_progress' : 'new';
    if (difficulty !== 'all' && problem.difficulty !== difficulty) return false;
    if (bugType !== 'all' && !problem.bugTypes.includes(bugType)) return false;
    if (topic !== 'all' && !problem.topics.includes(topic)) return false;
    if (status !== 'all' && derivedStatus !== status) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">React Debugging Catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Filter by bug type, topic, difficulty, and progress state.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4 text-sm">
          <label className="flex flex-col gap-2">Difficulty
            <select aria-label="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2">
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">Bug type
            <select aria-label="bug type" value={bugType} onChange={(event) => setBugType(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2">
              <option value="all">All</option>
              {bugTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2">Topic
            <select aria-label="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2">
              <option value="all">All</option>
              {topics.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2">Status
            <select aria-label="status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-transparent px-3 py-2">
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="in_progress">In progress</option>
              <option value="passed">Passed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((problem) => {
          const entry = getReactDebuggingProgress(progress, problem.id);
          return (
            <Link key={problem.id} to={`/react-debugging/${problem.id}`} className="glass rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-mist-300">{problem.difficulty}</p>
              <h3 className="mt-2 font-display text-lg">{problem.title}</h3>
              <p className="mt-2 text-xs text-mist-300">{problem.bugTypes.join(', ')}</p>
              <p className="mt-2 text-xs text-mist-400">{problem.topics.join(', ')}</p>
              <p className="mt-3 text-xs text-mist-400">Attempts: {entry.attempts} · Passes: {entry.passes}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default ReactDebuggingCatalog;
