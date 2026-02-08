import { QuizChoice, QuizQuestionType } from '../types/quiz';

type QuizChoiceListProps = {
  type: QuizQuestionType;
  choices: QuizChoice[];
  selected: string[];
  activeIndex: number;
  onSelect: (next: string[]) => void;
  onSetActive: (index: number) => void;
};

const QuizChoiceList = ({ type, choices, selected, activeIndex, onSelect, onSetActive }: QuizChoiceListProps) => {
  const toggle = (id: string) => {
    if (type === 'single_choice') {
      onSelect([id]);
      return;
    }
    if (selected.includes(id)) {
      onSelect(selected.filter((item) => item !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => {
        const isSelected = selected.includes(choice.id);
        const isActive = index === activeIndex;
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => toggle(choice.id)}
            onFocus={() => onSetActive(index)}
            className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
              isSelected ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100' : 'border-white/10 text-mist-200'
            } ${isActive ? 'ring-2 ring-ember-400/40' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-mist-400">{index + 1}</span>
              <span>{choice.text}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuizChoiceList;
