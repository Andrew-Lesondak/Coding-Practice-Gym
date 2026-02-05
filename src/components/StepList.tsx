import clsx from 'clsx';
import { Step } from '../types/problem';

const StepList = ({
  steps,
  completion,
  activeStep
}: {
  steps: Step[];
  completion: Record<number, boolean>;
  activeStep: number;
}) => {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const done = completion[step.index];
        return (
          <div
            key={step.index}
            className={clsx(
              'rounded-xl border px-4 py-3 transition',
              step.index === activeStep
                ? 'border-ember-500/60 bg-ember-500/10'
                : 'border-white/10'
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Step {step.index}</p>
              <span className={clsx('text-xs', done ? 'text-emerald-300' : 'text-mist-300')}>
                {done ? 'Complete' : 'Pending'}
              </span>
            </div>
            <p className="text-xs text-mist-200">{step.title}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StepList;
