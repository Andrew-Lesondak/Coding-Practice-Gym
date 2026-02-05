import { SystemDesignPrompt } from '../types/systemDesign';
import { ProgressState } from '../types/progress';
import { getSystemDesignProgress } from '../store/useAppStore';

export const getSystemDesignDue = (prompts: SystemDesignPrompt[], progress: ProgressState) => {
  const now = new Date();
  return prompts.filter((prompt) => {
    const p = getSystemDesignProgress(progress, prompt.id);
    if (!p.nextReviewAt) return false;
    return new Date(p.nextReviewAt) <= now;
  });
};

export const getSystemDesignContinue = (prompts: SystemDesignPrompt[], progress: ProgressState) => {
  return prompts.filter((prompt) => {
    const p = getSystemDesignProgress(progress, prompt.id);
    return p.attempts > 0 && p.passes === 0;
  });
};

export const getSystemDesignStats = (prompts: SystemDesignPrompt[], progress: ProgressState) => {
  const totals = prompts.reduce(
    (acc, prompt) => {
      const p = getSystemDesignProgress(progress, prompt.id);
      if (p.passes > 0) acc.completed += 1;
      if (p.attempts > 0) acc.started += 1;
      acc.attempts += p.attempts;
      return acc;
    },
    { completed: 0, started: 0, attempts: 0 }
  );

  return { ...totals, total: prompts.length };
};
