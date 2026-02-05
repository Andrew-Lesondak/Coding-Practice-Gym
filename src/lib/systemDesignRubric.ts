import { SystemDesignPrompt } from '../types/systemDesign';

export type RubricScore = {
  categoryScores: Record<string, number>;
  overall: number;
  missingItems: string[];
};

export const computeRubricScore = (
  rubric: SystemDesignPrompt['rubric'],
  checked: Record<string, boolean>
): RubricScore => {
  const categoryScores: Record<string, number> = {};
  let weightedSum = 0;
  let weightTotal = 0;
  const missingItems: string[] = [];

  rubric.categories.forEach((category) => {
    const totalWeight = category.items.reduce((sum, item) => sum + item.weight, 0) || 1;
    const checkedWeight = category.items.reduce((sum, item) => sum + (checked[item.id] ? item.weight : 0), 0);
    const score = checkedWeight / totalWeight;
    categoryScores[category.id] = score;
    weightedSum += score * category.weight;
    weightTotal += category.weight;

    category.items.forEach((item) => {
      if (!checked[item.id]) {
        missingItems.push(item.text);
      }
    });
  });

  const overall = weightTotal === 0 ? 0 : weightedSum / weightTotal;
  return { categoryScores, overall, missingItems };
};

export const getRubricSuggestions = (
  rubric: SystemDesignPrompt['rubric'],
  text: string
): Record<string, boolean> => {
  const lower = text.toLowerCase();
  const suggestions: Record<string, boolean> = {};
  rubric.categories.forEach((category) => {
    category.items.forEach((item) => {
      if (!item.suggestionKeywords || item.suggestionKeywords.length === 0) {
        suggestions[item.id] = false;
        return;
      }
      suggestions[item.id] = item.suggestionKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
    });
  });
  return suggestions;
};
