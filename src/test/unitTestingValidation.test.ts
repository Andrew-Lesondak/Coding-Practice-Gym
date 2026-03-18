import { validateUnitTestingProblem } from '../lib/authorValidation';
import { UnitTestingProblem } from '../types/unitTesting';

const baseProblem: UnitTestingProblem = {
  id: 'unit-problem',
  title: 'Unit Problem',
  difficulty: 'easy',
  category: 'unit',
  topics: ['arrange-act-assert'],
  framework: 'vitest',
  promptMarkdown: 'Prompt',
  requirements: ['One'],
  constraints: ['One'],
  sourceFiles: [
    {
      path: '/src/math.ts',
      language: 'ts',
      editable: false,
      contents: 'export const add = (a: number, b: number) => a + b;'
    }
  ],
  testStubFile: {
    path: '/src/math.test.ts',
    language: 'ts',
    contents: `import { describe, it, expect } from "vitest";
import { add } from "./math";

describe("add", () => {
  // Step 1: test add
  // TODO(step 1 start)
  // write a test
  // TODO(step 1 end)
});`
  },
  referenceTestFile: {
    path: '/src/math.test.ts',
    language: 'ts',
    contents: `import { describe, it, expect } from "vitest";
import { add } from "./math";

describe("add", () => {
  it("adds numbers", () => {
    expect(add(1, 2)).toBe(3);
  });
});`
  },
  testsMeta: { visibleChecks: ['a'], hiddenChecks: ['b'] },
  commonPitfalls: ['pitfall'],
  recallQuestions: ['question'],
  solutionNotes: {
    testingStrategyMarkdown: 'strategy',
    whyTheseAssertionsMarkdown: 'why',
    edgeCasesMarkdown: 'edges'
  },
  hiddenMutants: [
    {
      id: 'mutant',
      mutatedFiles: [{ path: '/src/math.ts', contents: 'export const add = (a: number, b: number) => a - b;' }]
    }
  ]
};

describe('unit testing validation', () => {
  it('accepts a valid unit testing problem', () => {
    const messages = validateUnitTestingProblem(baseProblem);
    expect(messages.filter((item) => item.type === 'error')).toEqual([]);
  });

  it('reports unresolved relative imports', () => {
    const messages = validateUnitTestingProblem({
      ...baseProblem,
      testStubFile: {
        ...baseProblem.testStubFile,
        contents: baseProblem.testStubFile.contents.replace('./math', './missing')
      }
    });

    expect(messages.some((item) => item.message.includes('Cannot resolve module'))).toBe(true);
  });
});
