import { useMemo, useState } from 'react';
import { useProblems } from '../lib/useProblems';
import ProblemCard from '../components/ProblemCard';
import FilterBar from '../components/FilterBar';
import { useAppStore } from '../store/useAppStore';

const difficultyOptions = ['All', 'Easy', 'Medium', 'Hard'];

const Catalog = () => {
  const [patternFilter, setPatternFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const progress = useAppStore((state) => state.progress);
  const problems = useProblems();

  const patterns = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((problem) => problem.patterns.forEach((pattern) => set.add(pattern)));
    return ['All', ...Array.from(set).sort()];
  }, [problems]);

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      const patternOk = patternFilter === 'All' || problem.patterns.includes(patternFilter);
      const difficultyOk = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
      return patternOk && difficultyOk;
    });
  }, [patternFilter, difficultyFilter]);

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-6">
        <h1 className="font-display text-2xl font-semibold">Problem catalog</h1>
        <p className="mt-2 text-sm text-mist-200">Filter by pattern and difficulty to plan your next sprint.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <FilterBar
            title="Pattern"
            options={patterns.map((pattern) => ({ label: pattern, value: pattern }))}
            active={patternFilter}
            onChange={setPatternFilter}
          />
          <FilterBar
            title="Difficulty"
            options={difficultyOptions.map((difficulty) => ({ label: difficulty, value: difficulty }))}
            active={difficultyFilter}
            onChange={setDifficultyFilter}
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} progress={progress.problems[problem.id]} />
        ))}
      </section>
    </div>
  );
};

export default Catalog;
