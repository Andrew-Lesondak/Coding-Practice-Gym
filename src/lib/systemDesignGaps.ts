import { SystemDesignPrompt } from '../types/systemDesign';
import { buildWhyItMatters, getSuggestedStepForItem } from './systemDesignMapping';

export type GapItem = {
  itemId: string;
  text: string;
  categoryId: string;
  categoryTitle: string;
  weight: number;
  suggestedStep: number;
  whyItMatters: string;
};

export const getMissingRubricItems = (
  rubric: SystemDesignPrompt['rubric'],
  checked: Record<string, boolean>
): GapItem[] => {
  const gaps: GapItem[] = [];
  rubric.categories.forEach((category) => {
    category.items.forEach((item) => {
      if (!checked[item.id]) {
        gaps.push({
          itemId: item.id,
          text: item.text,
          categoryId: category.id,
          categoryTitle: category.title,
          weight: item.weight,
          suggestedStep: getSuggestedStepForItem(item.id, category.id),
          whyItMatters: buildWhyItMatters(category.title, item.text)
        });
      }
    });
  });
  return gaps;
};

export const groupGapsByCategory = (gaps: GapItem[]) => {
  const map: Record<string, GapItem[]> = {};
  gaps.forEach((gap) => {
    map[gap.categoryTitle] = map[gap.categoryTitle] ?? [];
    map[gap.categoryTitle].push(gap);
  });
  return map;
};
