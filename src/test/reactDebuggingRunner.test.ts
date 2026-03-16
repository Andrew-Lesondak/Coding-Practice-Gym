import { expect as vitestExpect } from 'vitest';
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
      '/src/api/fakeUsers.ts': 'export const nope = true;'
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
        '/src/components/ProfilePanel.tsx': `import React from 'react';
import { fetchUserProfile } from '../api/fakeUsers';

export function ProfilePanel({ userId }: { userId: string }) {
  const [profile, setProfile] = React.useState(() => fetchUserProfile(userId));

  React.useEffect(() => {
    setProfile(fetchUserProfile(userId));
  }, [userId]);

  return (
    <section>
      <p data-testid="profile-name">{profile.name}</p>
      <p data-testid="profile-email">{profile.email}</p>
      <p data-testid="profile-team">{profile.team}</p>
    </section>
  );
}`
      },
      testCode: problem.tests.visible
    });

    expect(result.ok).toBe(true);
    expect(result.results[0]?.passed).toBe(true);
  });

  it('provides imported test helpers without leaking preview DOM', async () => {
    const previousExpect = (globalThis as { expect?: typeof vitestExpect }).expect;
    // Simulate the browser runtime where Vitest's global expect is unavailable.
    delete (globalThis as { expect?: typeof vitestExpect }).expect;

    const previewHost = document.createElement('div');
    previewHost.innerHTML = `
      <button data-testid="switch-2">Preview User 2</button>
      <button data-testid="switch-3">Preview User 3</button>
    `;
    document.body.appendChild(previewHost);

    try {
      const problem = reactDebuggingProblems[0];
      const result = await runReactDebuggingTests({
        problem,
        edits: {
          '/src/components/ProfilePanel.tsx': `import React from 'react';
import { fetchUserProfile } from '../api/fakeUsers';

export function ProfilePanel({ userId }: { userId: string }) {
  const [profile, setProfile] = React.useState(() => fetchUserProfile(userId));

  React.useEffect(() => {
    setProfile(fetchUserProfile(userId));
  }, [userId]);

  return (
    <section>
      <p data-testid="profile-name">{profile.name}</p>
      <p data-testid="profile-email">{profile.email}</p>
      <p data-testid="profile-team">{profile.team}</p>
    </section>
  );
}`
        },
        testCode: problem.tests.visible
      });

      vitestExpect(result.ok).toBe(true);
      vitestExpect(result.results.every((item) => item.passed)).toBe(true);
    } finally {
      if (previousExpect) {
        (globalThis as { expect?: typeof vitestExpect }).expect = previousExpect;
      }
      previewHost.remove();
    }
  });
});
