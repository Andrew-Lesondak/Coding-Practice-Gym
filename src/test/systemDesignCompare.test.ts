import { extractDesignSections } from '../lib/systemDesignCompare';

const stub = `## Step 1: Requirements and scope
[TEMPLATE_START step=1]
- Functional requirements:
  - Users can post
[TEMPLATE_END step=1]

## Step 2: APIs
[TEMPLATE_START step=2]
- APIs:
  - GET /posts
[TEMPLATE_END step=2]
`;

describe('extractDesignSections', () => {
  it('returns step sections with text', () => {
    const sections = extractDesignSections(stub);
    expect(sections).toHaveLength(2);
    expect(sections[0].stepNumber).toBe(1);
    expect(sections[0].textContent).toContain('Users can post');
  });
});
