import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataStructureProblems } from '../lib/useDataStructureProblems';
import { getDataStructureProgress, useAppStore } from '../store/useAppStore';

const DataStructuresCatalog = () => {
  const problems = useDataStructureProblems();
  const progress = useAppStore((state) => state.progress);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = useMemo(() => ['all', ...Array.from(new Set(problems.map((problem) => problem.category))).sort()], [problems]);
  const operations = useMemo(() => ['all', ...Array.from(new Set(problems.flatMap((problem) => problem.operations))).sort()], [problems]);

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      const entry = getDataStructureProgress(progress, problem.id);
      const status =
        entry.passes > 0 ? 'completed' : entry.attempts > 0 ? 'in-progress' : 'not-started';
      const difficultyOk = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
      const categoryOk = categoryFilter === 'all' || problem.category === categoryFilter;
      const operationOk = operationFilter === 'all' || problem.operations.includes(operationFilter);
      const statusOk = statusFilter === 'all' || status === statusFilter;
      return difficultyOk && categoryOk && operationOk && statusOk;
    });
  }, [problems, progress, difficultyFilter, categoryFilter, operationFilter, statusFilter]);

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-6">
        <h1 className="font-display text-2xl font-semibold">Data Structures catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Filter by structure family, core operation, and progress state.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <label className="text-sm">
            difficulty
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2" value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)}>
              <option value="all">all</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>
          <label className="text-sm">
            category
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-sm">
            operations
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2" value={operationFilter} onChange={(event) => setOperationFilter(event.target.value)}>
              {operations.map((operation) => <option key={operation} value={operation}>{operation}</option>)}
            </select>
          </label>
          <label className="text-sm">
            status
            <select className="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 p-2" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">all</option>
              <option value="not-started">not-started</option>
              <option value="in-progress">in-progress</option>
              <option value="completed">completed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((problem) => {
          const entry = getDataStructureProgress(progress, problem.id);
          const status = entry.passes > 0 ? 'Completed' : entry.attempts > 0 ? 'In progress' : 'Not started';
          return (
            <Link key={problem.id} to={`/data-structures/${problem.id}`} className="glass block rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg font-semibold">{problem.title}</p>
                  <p className="text-xs text-mist-300">{problem.structures.join(' • ')}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-mist-100">{problem.difficulty}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-mist-300">
                {problem.operations.map((operation) => (
                  <span key={operation} className="rounded-full border border-white/10 px-2 py-1">{operation}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-mist-300">
                <span>{status}</span>
                <span>{entry.attempts} attempts</span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default DataStructuresCatalog;
