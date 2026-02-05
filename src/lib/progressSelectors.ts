import { Problem } from '../types/problem';
import { ProgressState } from '../types/progress';
import { getProblemProgress } from '../store/useAppStore';

export const getDueReviews = (problems: Problem[], progress: ProgressState) => {
  const now = new Date();
  return problems.filter((problem) => {
    const p = getProblemProgress(progress, problem.id);
    if (!p.nextReviewAt) {
      return false;
    }
    return new Date(p.nextReviewAt) <= now;
  });
};

export const getContinueSolving = (problems: Problem[], progress: ProgressState) => {
  return problems.filter((problem) => {
    const p = getProblemProgress(progress, problem.id);
    return p.attempts > 0 && p.passes === 0;
  });
};

export const getStats = (problems: Problem[], progress: ProgressState) => {
  const totals = problems.reduce(
    (acc, problem) => {
      const p = getProblemProgress(progress, problem.id);
      if (p.passes > 0) {
        acc.completed += 1;
      }
      if (p.attempts > 0) {
        acc.started += 1;
      }
      acc.attempts += p.attempts;
      return acc;
    },
    { completed: 0, started: 0, attempts: 0 }
  );

  return {
    ...totals,
    total: problems.length
  };
};
