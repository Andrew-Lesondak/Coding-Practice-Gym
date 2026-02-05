import { computeRubricScore, getRubricSuggestions } from '../lib/systemDesignRubric';

const rubric = {
  categories: [
    {
      id: 'c1',
      title: 'Category 1',
      weight: 2,
      items: [
        { id: 'i1', text: 'Item 1', weight: 1, suggestionKeywords: ['cache'] },
        { id: 'i2', text: 'Item 2', weight: 1 }
      ]
    },
    {
      id: 'c2',
      title: 'Category 2',
      weight: 1,
      items: [{ id: 'i3', text: 'Item 3', weight: 1, suggestionKeywords: ['queue'] }]
    }
  ]
};

describe('system design rubric', () => {
  it('computes weighted scores', () => {
    const score = computeRubricScore(rubric, { i1: true, i2: false, i3: true });
    expect(score.categoryScores.c1).toBe(0.5);
    expect(score.categoryScores.c2).toBe(1);
    expect(score.overall).toBeGreaterThan(0);
  });

  it('returns suggestions without auto-checking', () => {
    const suggestions = getRubricSuggestions(rubric, 'Use cache and queue');
    expect(suggestions.i1).toBe(true);
    expect(suggestions.i3).toBe(true);
  });

  it('suggestions do not affect score', () => {
    const suggestions = getRubricSuggestions(rubric, 'Use cache and queue');
    const score = computeRubricScore(rubric, {});
    expect(suggestions.i1).toBe(true);
    expect(score.overall).toBe(0);
  });
});
