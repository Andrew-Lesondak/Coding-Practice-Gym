import { classifyError } from '../lib/runnerUtils';
import {
  normalizeDebuggingPath,
  resolveDebuggingImport,
  searchDebuggingFiles,
  validateReactDebuggingSubmission,
  runReactDebuggingTests
} from '../lib/reactDebuggingRunner';
import { reactDebuggingProblems } from '../data/reactDebuggingProblems';

describe('react debugging runner', () => {
  it('resolves relative modules across tsx files', () => {
    const resolved = resolveDebuggingImport('/src/App.tsx', './ProfileCard', [
      { path: '/src/App.tsx' },
      { path: '/src/ProfileCard.tsx' }
    ]);
    expect(resolved).toBe('/src/ProfileCard.tsx');
  });

  it('normalizes file search results', () => {
    const matches = searchDebuggingFiles(
      reactDebuggingProblems[0].codebase.files.map((file) => ({ ...file, path: normalizeDebuggingPath(file.path) })),
      'user'
    );
    expect(matches[0]?.path).toBe('/src/App.tsx');
  });

  it('blocks edits to read-only files', () => {
    const errors = validateReactDebuggingSubmission(reactDebuggingProblems[0], {
      '/src/api.ts': 'export const nope = true;'
    });
    expect(errors[0]).toContain('read-only');
  });

  it('classifies unresolved modules', () => {
    expect(classifyError(new Error('Cannot resolve module "./missing" from "/src/App.tsx"'))).toBe('MODULE_RESOLUTION_ERROR');
  });

  it('runs visible tests for a repaired challenge', async () => {
    const problem = reactDebuggingProblems[0];
    const result = await runReactDebuggingTests({
      problem,
      edits: {
        '/src/ProfileCard.tsx': `import React from 'react';
import { fetchUser } from './api';

export function ProfileCard({ userId }: { userId: string }) {
  const [name, setName] = React.useState('loading');
  React.useEffect(() => {
    setName(fetchUser(userId).name);
  }, [userId]);
  return <p data-testid="name">{name}</p>;
}`
      },
      testCode: problem.tests.visible
    });

    expect(result.ok).toBe(true);
    expect(result.results[0]?.passed).toBe(true);
  });
});
