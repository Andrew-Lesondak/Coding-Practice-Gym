import clsx from 'clsx';
import { Step } from '../types/problem';
import { StepStatus } from '../types/progress';

const StepList = ({
  steps,
  completion,
  activeStep,
  onSelect,
  showDescription = true,
  hintLevel = 1,
  hints
}: {
  steps: Step[];
  completion: Record<number, StepStatus>;
  activeStep: number;
  onSelect?: (stepIndex: number) => void;
  showDescription?: boolean;
  hintLevel?: number;
  hints?: Record<number, { level1: string; level2: string; level3: string }>;
}) => {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const status = completion[step.index] ?? 'not_started';
        return (
          <button
            key={step.index}
            type="button"
            onClick={() => onSelect?.(step.index)}
            className={clsx(
              'w-full rounded-xl border px-4 py-3 text-left transition',
              step.index === activeStep
                ? 'border-ember-500/60 bg-ember-500/10'
                : 'border-white/10'
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Step {step.index}</p>
              <span
                className={clsx(
                  'text-xs',
                  status === 'completed'
                    ? 'text-emerald-300'
                    : status === 'in_progress'
                    ? 'text-amber-300'
                    : 'text-mist-300'
                )}
              >
                {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started'}
              </span>
            </div>
            {showDescription && <p className="text-xs text-mist-200">{step.title}</p>}
            {hintLevel >= 1 && hints?.[step.index] && (
              <p className="mt-2 text-xs text-mist-300">
                {hintLevel >= 3
                  ? hints[step.index].level3
                  : hintLevel >= 2
                  ? hints[step.index].level2
                  : hints[step.index].level1}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StepList;
