import { SystemDesignPrompt } from '../types/systemDesign';

export const getRubricSubset = (
  rubric: SystemDesignPrompt['rubric'],
  subset: { categoryIds: string[]; itemIds: string[] }
) => {
  return {
    categories: rubric.categories
      .filter((category) => subset.categoryIds.includes(category.id))
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => subset.itemIds.includes(item.id))
      }))
  };
};
