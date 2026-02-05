import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Problem } from '../types/problem';
import { ProblemProgress } from '../types/progress';

const difficultyStyles: Record<Problem['difficulty'], string> = {
  Easy: 'bg-emerald-400/15 text-emerald-300',
  Medium: 'bg-amber-400/15 text-amber-300',
  Hard: 'bg-rose-400/15 text-rose-300'
};

const ProblemCard = ({
  problem,
  progress
}: {
  problem: Problem;
  progress?: ProblemProgress;
}) => {
  const completed = progress?.passes && progress.passes > 0;
  const attempts = progress?.attempts ?? 0;
  const hasExplanation = Boolean(progress?.explanation);
  return (
    <Link
      to={`/problem/${problem.id}`}
      className="glass block rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold">{problem.title}</p>
          <p className="text-xs text-mist-300">{problem.patterns.join(' • ')}</p>
        </div>
        <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', difficultyStyles[problem.difficulty])}>
          {problem.difficulty}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-mist-300">
        <span>{completed ? 'Completed' : attempts > 0 ? 'In progress' : 'Not started'}</span>
        <span>{attempts} attempts</span>
      </div>
      <div className="mt-3">
        <span
          className={clsx(
            'rounded-full px-3 py-1 text-[10px] font-semibold',
            hasExplanation ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-mist-300'
          )}
        >
          {hasExplanation ? 'Has explanation' : 'Missing explanation'}
        </span>
      </div>
    </Link>
  );
};

export default ProblemCard;
