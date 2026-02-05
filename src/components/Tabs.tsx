import clsx from 'clsx';

export type Tab = {
  id: string;
  label: string;
};

const Tabs = ({
  tabs,
  active,
  onChange
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}) => {
  return (
    <div className="flex gap-6 border-b border-white/10 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={clsx('pb-3 transition', active === tab.id ? 'tab-active' : 'text-mist-300')}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
