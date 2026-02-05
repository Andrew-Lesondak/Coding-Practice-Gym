import { getRubricSubset } from '../lib/systemDesignDrillRubric';

describe('drill rubric subset', () => {
  it('filters rubric by subset ids', () => {
    const rubric = {
      categories: [
        { id: 'a', title: 'A', weight: 1, items: [{ id: 'i1', text: 'I1', weight: 1 }] },
        { id: 'b', title: 'B', weight: 1, items: [{ id: 'i2', text: 'I2', weight: 1 }] }
      ]
    };
    const subset = getRubricSubset(rubric as any, { categoryIds: ['a'], itemIds: ['i1'] });
    expect(subset.categories).toHaveLength(1);
    expect(subset.categories[0].items).toHaveLength(1);
  });
});
