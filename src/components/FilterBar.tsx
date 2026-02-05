import clsx from 'clsx';

type FilterOption = {
  label: string;
  value: string;
};

const FilterBar = ({
  title,
  options,
  active,
  onChange
}: {
  title: string;
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
}) => {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              'rounded-full border border-white/10 px-4 py-1 text-sm transition',
              active === option.value
                ? 'border-ember-500/60 bg-ember-500/10 text-ember-400'
                : 'text-mist-200 hover:border-white/20'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
