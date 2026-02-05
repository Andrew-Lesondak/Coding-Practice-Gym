import { SystemDesignPrompt } from '../types/systemDesign';
import { RubricScore } from '../lib/systemDesignRubric';

const SystemDesignRubric = ({
  rubric,
  checked,
  suggestions,
  scores,
  onToggle
}: {
  rubric: SystemDesignPrompt['rubric'];
  checked: Record<string, boolean>;
  suggestions: Record<string, boolean>;
  scores: RubricScore;
  onToggle: (itemId: string, value: boolean) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 p-3 text-xs text-mist-200">
        <p className="font-semibold text-mist-100">Overall score</p>
        <p>{Math.round(scores.overall * 100)}%</p>
      </div>
      {rubric.categories.map((category) => (
        <div key={category.id} className="rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{category.title}</p>
            <span className="text-xs text-mist-300">{Math.round(scores.categoryScores[category.id] * 100)}%</span>
          </div>
          <div className="mt-3 space-y-2">
            {category.items.map((item) => {
              const suggested = suggestions[item.id];
              return (
                <label key={item.id} className="flex items-start gap-2 text-xs text-mist-200">
                  <input
                    type="checkbox"
                    checked={checked[item.id] ?? false}
                    onChange={(event) => onToggle(item.id, event.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    {item.text}
                    {suggested && <span className="ml-2 text-amber-300">Suggested</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {scores.missingItems.length > 0 && (
        <div className="rounded-xl border border-white/10 p-3 text-xs text-mist-200">
          <p className="font-semibold text-mist-100">Missing items</p>
          <ul className="mt-2 space-y-1">
            {scores.missingItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SystemDesignRubric;
