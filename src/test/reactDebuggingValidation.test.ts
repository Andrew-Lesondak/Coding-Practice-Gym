import { validateReactDebuggingProblem } from '../lib/authorValidation';
import { ReactDebuggingProblem } from '../types/reactDebugging';

const baseProblem: ReactDebuggingProblem = {
  id: 'demo',
  title: 'Demo',
  difficulty: 'easy',
  topics: ['effects'],
  bugTypes: ['missing dependency'],
  briefMarkdown: 'demo',
  codebase: {
    files: [
      {
        path: '/src/App.tsx',
        language: 'tsx',
        contents: `import Missing from './Missing'; export default function App() { return <Missing />; }`,
        editable: true
      }
    ]
  },
  entryFile: '/src/App.tsx',
  tests: { visible: `export const tests = [];`, hidden: `export const tests = [];` },
  reproductionHints: [],
  maintainabilityNotes: [],
  solutionNotes: {
    rootCauseMarkdown: '',
    fixSummaryMarkdown: '',
    edgeCasesMarkdown: ''
  },
  recallQuestions: [],
  metadata: { estimatedMinutes: 5 }
};

describe('react debugging validation', () => {
  it('flags unresolved imports', () => {
    const messages = validateReactDebuggingProblem(baseProblem);
    expect(messages.some((message) => message.message.includes('Cannot resolve module'))).toBe(true);
  });

  it('requires the entry file to exist', () => {
    const messages = validateReactDebuggingProblem({ ...baseProblem, entryFile: '/src/Other.tsx' });
    expect(messages.some((message) => message.message.includes('Entry file must exist'))).toBe(true);
  });
});
