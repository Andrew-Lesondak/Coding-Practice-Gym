import { getMissingRubricItems } from '../lib/systemDesignGaps';

const rubric = {
  categories: [
    {
      id: 'requirements',
      title: 'Requirements',
      weight: 1,
      items: [
        { id: 'req-functional', text: 'Functional requirements', weight: 2 },
        { id: 'req-nonfunctional', text: 'Non-functional requirements', weight: 1 }
      ]
    }
  ]
};

describe('system design gaps', () => {
  it('returns missing items', () => {
    const gaps = getMissingRubricItems(rubric as any, { 'req-functional': true });
    expect(gaps.length).toBe(1);
    expect(gaps[0].itemId).toBe('req-nonfunctional');
    expect(gaps[0].suggestedStep).toBe(1);
  });
});
