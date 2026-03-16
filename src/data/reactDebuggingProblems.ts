import { ReactDebuggingProblem } from '../types/reactDebugging';

type SeedChallenge = ReactDebuggingProblem & {
  referenceEdits: Record<string, string>;
};

const createSeed = (seed: SeedChallenge) => seed;

const countTestNames = (code: string) => (code.match(/name:\s*['"`]/g) ?? []).length;

const seeds = [
  createSeed({
    id: 'react-debug-profile-switch-refresh',
    title: 'Profile Switch Does Not Refresh Data',
    difficulty: 'easy',
    topics: ['useEffect', 'props', 'data fetching', 'stale data'],
    bugTypes: ['missing dependency'],
    briefMarkdown: `### Scenario
An internal admin tool shows a user header and a profile details panel. Selecting a different user updates the selected header immediately, but the fetched details panel stays stale.

### Reported issue
Interviewers expect you to reproduce the bug by switching users, trace which component owns the fetch, and make the smallest correct fix.

### Expected behavior
The profile details should always match the currently selected user.

### Observed behavior
The header changes, but the fetched details can stay stuck on a previous user.

### Constraints
- Keep the existing component split
- Do not rewrite the fetch flow
- Make the minimal maintainable fix`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { UserSwitcher } from './components/UserSwitcher';
import { ProfilePanel } from './components/ProfilePanel';

export default function App() {
  const [userId, setUserId] = React.useState('1');

  return (
    <div>
      <h1 data-testid="selected-header">Selected user: {userId}</h1>
      <UserSwitcher currentUserId={userId} onSelect={setUserId} />
      <ProfilePanel userId={userId} />
    </div>
  );
}`
        },
        {
          path: '/src/components/UserSwitcher.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';

export function UserSwitcher({
  currentUserId,
  onSelect
}: {
  currentUserId: string;
  onSelect: (userId: string) => void;
}) {
  return (
    <div>
      {['1', '2', '3'].map((userId) => (
        <button
          key={userId}
          data-testid={\`switch-\${userId}\`}
          aria-pressed={currentUserId === userId}
          onClick={() => onSelect(userId)}
        >
          User {userId}
        </button>
      ))}
    </div>
  );
}`
        },
        {
          path: '/src/components/ProfilePanel.tsx',
          language: 'tsx',
          editable: true,
          contents: `import React from 'react';
import { fetchUserProfile } from '../api/fakeUsers';

export function ProfilePanel({ userId }: { userId: string }) {
  const [profile, setProfile] = React.useState(() => fetchUserProfile(userId));

  React.useEffect(() => {
    setProfile(fetchUserProfile(userId));
  }, []);

  return (
    <section>
      <p data-testid="profile-name">{profile.name}</p>
      <p data-testid="profile-email">{profile.email}</p>
      <p data-testid="profile-team">{profile.team}</p>
    </section>
  );
}`
        },
        {
          path: '/src/api/fakeUsers.ts',
          language: 'ts',
          editable: false,
          contents: `const users: Record<string, { name: string; email: string; team: string }> = {
  '1': { name: 'Ada Lovelace', email: 'ada@example.com', team: 'Platform' },
  '2': { name: 'Grace Hopper', email: 'grace@example.com', team: 'Compiler' },
  '3': { name: 'Linus Torvalds', email: 'linus@example.com', team: 'Kernel' }
};

export const fetchUserProfile = (userId: string) => users[userId];`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'loads the initial profile',
    run: () => {
      render(React.createElement(App));
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Ada Lovelace');
      expect(screen.getByTestId('profile-email')).toHaveTextContent('ada@example.com');
    }
  },
  {
    name: 'switching to another user refreshes details',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByTestId('switch-2'));
      expect(screen.getByTestId('selected-header')).toHaveTextContent('2');
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Grace Hopper');
    }
  },
  {
    name: 'switching back refreshes correctly',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByTestId('switch-2'));
      fireEvent.click(screen.getByTestId('switch-1'));
      expect(screen.getByTestId('profile-email')).toHaveTextContent('ada@example.com');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'rapid switching still shows the latest chosen user',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByTestId('switch-3'));
      fireEvent.click(screen.getByTestId('switch-2'));
      fireEvent.click(screen.getByTestId('switch-1'));
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Ada Lovelace');
    }
  },
  {
    name: 'stale previous user details are not left behind',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByTestId('switch-3'));
      expect(screen.getByTestId('profile-email')).toHaveTextContent('linus@example.com');
      expect(screen.getByTestId('profile-email').textContent).toBe('linus@example.com');
    }
  }
];`
    },
    reproductionHints: [
      'Run the app and switch from User 1 to User 2.',
      'Notice that the selected header updates immediately.',
      'Compare the header with the profile details panel.'
    ],
    maintainabilityNotes: [
      'Effects should list every reactive value they read from the component scope.',
      'Keep the fetch logic in the data-owning component instead of moving it into the switcher.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The profile panel effect read `userId`, but the dependency array was empty, so React only ran the fetch logic on mount.',
      fixSummaryMarkdown: 'Add `userId` to the effect dependency list so the details refetch whenever the selected user changes.',
      edgeCasesMarkdown: 'Verify the latest user remains correct after switching back and forth quickly. A reviewer should also watch for stale state if the fetch later becomes asynchronous.'
    },
    recallQuestions: [
      'Why did the selected header update while the profile details stayed stale?',
      'What rule helps you decide whether a value belongs in an effect dependency list?'
    ],
    metadata: { estimatedMinutes: 8 },
    allowedEditablePaths: ['/src/components/ProfilePanel.tsx'],
    referenceEdits: {
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
    }
  }),
  createSeed({
    id: 'react-debug-stale-ticker',
    title: 'Timer Freezes or Counts Incorrectly',
    difficulty: 'medium',
    topics: ['hooks', 'intervals', 'stale closures', 'state updates'],
    bugTypes: ['stale closure'],
    briefMarkdown: `### Scenario
A shared timer widget is used in multiple dashboards. It should tick while running, pause cleanly, and resume from the current value.

### Reported issue
The timer often freezes at 1 after starting. Interviewers expect you to inspect the timer hook instead of rewriting the widget.

### Expected behavior
The count should keep increasing while running, pause when requested, and resume from the current value.

### Observed behavior
The timer freezes or behaves inconsistently after pause and resume.

### Constraints
- Keep the existing interval-based approach
- Make the smallest closure-safe fix`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { TimerWidget } from './components/TimerWidget';

export default function App() {
  const [mounted, setMounted] = React.useState(true);

  return (
    <div>
      <button onClick={() => setMounted((value) => !value)}>
        {mounted ? 'Unmount timer' : 'Mount timer'}
      </button>
      {mounted ? <TimerWidget /> : <p data-testid="timer-unmounted">timer removed</p>}
    </div>
  );
}`
        },
        {
          path: '/src/components/TimerWidget.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { useTicker } from '../hooks/useTicker';
import { getActiveTickerCount } from '../utils/tickerDebug';

export function TimerWidget() {
  const [running, setRunning] = React.useState(true);
  const count = useTicker(running);

  return (
    <div>
      <p data-testid="timer-count">{count}</p>
      <p data-testid="ticker-active-count">{getActiveTickerCount()}</p>
      <button onClick={() => setRunning(false)}>Pause</button>
      <button onClick={() => setRunning(true)}>Resume</button>
    </div>
  );
}`
        },
        {
          path: '/src/hooks/useTicker.ts',
          language: 'ts',
          editable: true,
          contents: `import React from 'react';
import { trackTickerStart, trackTickerStop } from '../utils/tickerDebug';

export function useTicker(running: boolean) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;

    trackTickerStart();
    const intervalId = window.setInterval(() => {
      setCount(count + 1);
    }, 20);

    return () => {
      window.clearInterval(intervalId);
      trackTickerStop();
    };
  }, [running]);

  return count;
}`
        },
        {
          path: '/src/utils/tickerDebug.ts',
          language: 'ts',
          editable: false,
          contents: `let activeTickerCount = 0;

export const trackTickerStart = () => {
  activeTickerCount += 1;
};

export const trackTickerStop = () => {
  activeTickerCount -= 1;
};

export const getActiveTickerCount = () => activeTickerCount;`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const tests = [
  {
    name: 'timer increments over time',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(75);
      });
      expect(Number(screen.getByTestId('timer-count').textContent)).toBeGreaterThan(1);
    }
  },
  {
    name: 'pause stops incrementing',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(45);
      });
      fireEvent.click(screen.getByText('Pause'));
      const pausedCount = Number(screen.getByTestId('timer-count').textContent);
      await act(async () => {
        await wait(45);
      });
      expect(Number(screen.getByTestId('timer-count').textContent)).toBe(pausedCount);
    }
  },
  {
    name: 'resume continues from the current value',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(45);
      });
      fireEvent.click(screen.getByText('Pause'));
      const pausedCount = Number(screen.getByTestId('timer-count').textContent);
      fireEvent.click(screen.getByText('Resume'));
      await act(async () => {
        await wait(45);
      });
      expect(Number(screen.getByTestId('timer-count').textContent)).toBeGreaterThan(pausedCount);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';
import { getActiveTickerCount } from './src/utils/tickerDebug';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const tests = [
  {
    name: 'repeated pause and resume does not leave duplicate intervals running',
    run: async () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Pause'));
      fireEvent.click(screen.getByText('Resume'));
      fireEvent.click(screen.getByText('Pause'));
      fireEvent.click(screen.getByText('Resume'));
      expect(getActiveTickerCount()).toBe(1);
      await act(async () => {
        await wait(35);
      });
      expect(getActiveTickerCount()).toBe(1);
    }
  },
  {
    name: 'cleanup runs on unmount',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(20);
      });
      fireEvent.click(screen.getByText('Unmount timer'));
      expect(screen.getByTestId('timer-unmounted')).toHaveTextContent('timer removed');
      expect(getActiveTickerCount()).toBe(0);
    }
  }
];`
    },
    reproductionHints: [
      'Let the timer run for a moment and watch whether it moves past 1.',
      'Pause and resume a few times to verify it continues from the current count.',
      'The timer logic lives in the hook, not the widget shell.'
    ],
    maintainabilityNotes: [
      'Interval callbacks that derive next state from previous state should avoid closing over stale values.',
      'Keep interval setup and cleanup symmetrical so future behavior stays predictable.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The interval callback captured the `count` value from the render that created the interval. After the first tick, it kept writing the same stale next value.',
      fixSummaryMarkdown: 'Use a functional state update inside the interval callback so each tick derives from the latest committed count.',
      edgeCasesMarkdown: 'Pause and resume should not create duplicate intervals, and cleanup should still run on unmount. A reviewer should verify that only one timer is active at a time.'
    },
    recallQuestions: [
      'Why is `setCount(count + 1)` unsafe inside a long-lived interval?',
      'What makes the functional updater pattern closure-safe here?'
    ],
    metadata: { estimatedMinutes: 10 },
    allowedEditablePaths: ['/src/hooks/useTicker.ts'],
    referenceEdits: {
      '/src/hooks/useTicker.ts': `import React from 'react';
import { trackTickerStart, trackTickerStop } from '../utils/tickerDebug';

export function useTicker(running: boolean) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;

    trackTickerStart();
    const intervalId = window.setInterval(() => {
      setCount((current) => current + 1);
    }, 20);

    return () => {
      window.clearInterval(intervalId);
      trackTickerStop();
    };
  }, [running]);

  return count;
}`
    }
  }),
  createSeed({
    id: 'react-debug-search-race',
    title: 'Search Results Show the Wrong Query',
    difficulty: 'medium',
    topics: ['async', 'useEffect cleanup', 'race conditions', 'search UI'],
    bugTypes: ['race condition'],
    briefMarkdown: `### Scenario
A search box fetches suggestions from a fake API. Typing quickly should only show results for the latest query.

### Reported issue
Users say the suggestions sometimes match an older query they already typed past.

### Expected behavior
Only the latest request should be allowed to update the UI.

### Observed behavior
Older, slower requests overwrite newer results.

### Constraints
- Keep the hook-based fetch flow
- Use a minimal stale-response guard or cancellation pattern`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { SearchBox } from './components/SearchBox';

export default function App() {
  return (
    <div>
      <h1>Suggestion Search</h1>
      <SearchBox />
    </div>
  );
}`
        },
        {
          path: '/src/components/SearchBox.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { useSearch } from '../hooks/useSearch';

export function SearchBox() {
  const [query, setQuery] = React.useState('');
  const { results, loading } = useSearch(query);

  return (
    <section>
      <input
        aria-label="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p data-testid="loading-state">{loading ? 'loading' : 'idle'}</p>
      <p data-testid="result-count">{results.length}</p>
      <ul>
        {results.map((result) => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </section>
  );
}`
        },
        {
          path: '/src/hooks/useSearch.ts',
          language: 'ts',
          editable: true,
          contents: `import React from 'react';
import { fakeSearch } from '../api/fakeSearch';

export function useSearch(query: string) {
  const [results, setResults] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fakeSearch(query).then((nextResults) => {
      setResults(nextResults);
      setLoading(false);
    });
  }, [query]);

  return { results, loading };
}`
        },
        {
          path: '/src/api/fakeSearch.ts',
          language: 'ts',
          editable: false,
          contents: `const delays: Record<string, number> = {
  re: 35,
  rea: 10,
  react: 5,
  slow: 30
};

const catalog: Record<string, string[]> = {
  re: ['redux', 'relay'],
  rea: ['react', 'reason'],
  react: ['react', 'react hooks'],
  slow: ['slow mode']
};

export async function fakeSearch(query: string) {
  const delay = delays[query] ?? 8;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return catalog[query] ?? [];
}`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const tests = [
  {
    name: 'latest query results are shown',
    run: async () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 're' } });
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'react' } });
      await act(async () => {
        await wait(45);
      });
      expect(screen.getByText('react')).toBeTruthy();
      expect(screen.queryByText('redux')).toBeFalsy();
    }
  },
  {
    name: 'loading state returns to idle after the latest response',
    run: async () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'rea' } });
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
      await act(async () => {
        await wait(20);
      });
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    }
  },
  {
    name: 'older result does not overwrite a newer one',
    run: async () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 're' } });
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'rea' } });
      await act(async () => {
        await wait(45);
      });
      expect(screen.getByText('react')).toBeTruthy();
      expect(screen.queryByText('redux')).toBeFalsy();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const tests = [
  {
    name: 'empty query resets results safely',
    run: async () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'react' } });
      await act(async () => {
        await wait(12);
      });
      fireEvent.change(screen.getByLabelText('search'), { target: { value: '' } });
      expect(screen.getByTestId('result-count')).toHaveTextContent('0');
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle');
    }
  },
  {
    name: 'rapid typing followed by clearing does not leak stale results',
    run: async () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'slow' } });
      fireEvent.change(screen.getByLabelText('search'), { target: { value: '' } });
      await act(async () => {
        await wait(40);
      });
      expect(screen.getByTestId('result-count')).toHaveTextContent('0');
      expect(screen.queryByText('slow mode')).toBeFalsy();
    }
  }
];`
    },
    reproductionHints: [
      'Type `re`, then quickly continue to `react`.',
      'Watch whether an older response overwrites the newest list.',
      'The request logic is isolated in the hook.'
    ],
    maintainabilityNotes: [
      'Async effects should guard against stale responses before committing results.',
      'Reset behavior for empty queries should stay explicit and deterministic.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The hook let every promise resolution call `setResults`, even when the response belonged to an older query.',
      fixSummaryMarkdown: 'Track whether the current effect is still the latest request, and ignore stale responses when a newer query starts or the input clears.',
      edgeCasesMarkdown: 'Fast typing and clearing the input should not leave stale suggestions behind. A reviewer should check that loading state is also tied to the latest request.'
    },
    recallQuestions: [
      'Why can two successful async responses still produce the wrong UI order?',
      'What is the minimal pattern for ignoring stale search responses in React?'
    ],
    metadata: { estimatedMinutes: 11 },
    allowedEditablePaths: ['/src/hooks/useSearch.ts'],
    referenceEdits: {
      '/src/hooks/useSearch.ts': `import React from 'react';
import { fakeSearch } from '../api/fakeSearch';

export function useSearch(query: string) {
  const [results, setResults] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    if (!query) {
      setResults([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    fakeSearch(query).then((nextResults) => {
      if (!active) return;
      setResults(nextResults);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [query]);

  return { results, loading };
}`
    }
  }),
  createSeed({
    id: 'react-debug-todo-mutation',
    title: 'Todo List Updates Unreliably',
    difficulty: 'easy',
    topics: ['immutability', 'arrays', 'state updates'],
    bugTypes: ['mutation bug'],
    briefMarkdown: `### Scenario
A small todo list should support adding and toggling items during an interview debugging exercise.

### Reported issue
The list sometimes appears to ignore updates or behaves inconsistently after several operations.

### Expected behavior
Adding and toggling todos should produce predictable rerenders and preserve existing items.

### Observed behavior
Operations mutate existing state structures before calling \`setState\`.

### Constraints
- Keep the helper-based structure
- Fix the bug with minimal immutable updates`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { TodoList } from './components/TodoList';

export default function App() {
  return <TodoList />;
}`
        },
        {
          path: '/src/components/TodoList.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { TodoItem } from './TodoItem';
import { addTodo, toggleTodo } from '../utils/todoHelpers';

type Todo = { id: string; text: string; done: boolean };

export function TodoList() {
  const [text, setText] = React.useState('');
  const [todos, setTodos] = React.useState<Todo[]>([
    { id: '1', text: 'Read code first', done: false }
  ]);

  return (
    <section>
      <input
        aria-label="new todo"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button
        onClick={() => {
          if (!text.trim()) return;
          setTodos(addTodo(todos, text.trim()));
          setText('');
        }}
      >
        Add todo
      </button>
      <p data-testid="todo-count">{todos.length}</p>
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => setTodos(toggleTodo(todos, todo.id))}
          />
        ))}
      </ul>
    </section>
  );
}`
        },
        {
          path: '/src/components/TodoItem.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';

export function TodoItem({
  todo,
  onToggle
}: {
  todo: { id: string; text: string; done: boolean };
  onToggle: () => void;
}) {
  return (
    <li>
      <label>
        <input
          aria-label={todo.text}
          type="checkbox"
          checked={todo.done}
          onChange={onToggle}
        />
        <span data-testid={\`todo-\${todo.id}\`}>{todo.text}:{todo.done ? 'done' : 'pending'}</span>
      </label>
    </li>
  );
}`
        },
        {
          path: '/src/utils/todoHelpers.ts',
          language: 'ts',
          editable: true,
          contents: `type Todo = { id: string; text: string; done: boolean };

export function addTodo(todos: Todo[], text: string) {
  todos.push({
    id: String(todos.length + 1),
    text,
    done: false
  });

  return todos;
}

export function toggleTodo(todos: Todo[], id: string) {
  const nextTodos = todos;
  const todo = nextTodos.find((item) => item.id === id);
  if (todo) {
    todo.done = !todo.done;
  }
  return nextTodos;
}`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'adding a todo updates the rendered list',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('new todo'), { target: { value: 'Write tests' } });
      fireEvent.click(screen.getByText('Add todo'));
      expect(screen.getByTestId('todo-count')).toHaveTextContent('2');
      expect(screen.getByText(/Write tests/)).toBeTruthy();
    }
  },
  {
    name: 'toggling a todo updates its checked state',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByLabelText('Read code first'));
      expect(screen.getByTestId('todo-1')).toHaveTextContent('done');
    }
  },
  {
    name: 'adding multiple todos preserves prior state correctly',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('new todo'), { target: { value: 'Write tests' } });
      fireEvent.click(screen.getByText('Add todo'));
      fireEvent.change(screen.getByLabelText('new todo'), { target: { value: 'Ship fix' } });
      fireEvent.click(screen.getByText('Add todo'));
      expect(screen.getByTestId('todo-count')).toHaveTextContent('3');
      expect(screen.getByText(/Ship fix/)).toBeTruthy();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'toggling one item does not mutate sibling items incorrectly',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('new todo'), { target: { value: 'Write tests' } });
      fireEvent.click(screen.getByText('Add todo'));
      fireEvent.click(screen.getByLabelText('Read code first'));
      expect(screen.getByTestId('todo-1')).toHaveTextContent('done');
      expect(screen.getByTestId('todo-2')).toHaveTextContent('pending');
    }
  },
  {
    name: 'repeated operations remain stable',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('new todo'), { target: { value: 'Write tests' } });
      fireEvent.click(screen.getByText('Add todo'));
      fireEvent.click(screen.getByLabelText('Read code first'));
      fireEvent.click(screen.getByLabelText('Read code first'));
      expect(screen.getByTestId('todo-1')).toHaveTextContent('pending');
    }
  }
];`
    },
    reproductionHints: [
      'Try adding two items in a row.',
      'Then toggle the original item and watch whether the UI consistently rerenders.',
      'The helper file is the most likely place to inspect first.'
    ],
    maintainabilityNotes: [
      'State helpers should return new arrays or objects instead of mutating inputs.',
      'Small immutable updates are easier to reason about and safer for future memoization.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The helper functions mutated the original `todos` array and todo objects before returning them, so React often saw the same reference and skipped the expected update path.',
      fixSummaryMarkdown: 'Return new arrays and copy the changed todo instead of mutating existing state in place.',
      edgeCasesMarkdown: 'Adding and toggling in sequence should preserve older items and avoid leaking mutations into siblings. A code reviewer should watch for both array and nested object mutation.'
    },
    recallQuestions: [
      'Why can direct mutation make updates feel inconsistent in React?',
      'Which references need to change for React to see an immutable update clearly?'
    ],
    metadata: { estimatedMinutes: 8 },
    allowedEditablePaths: ['/src/utils/todoHelpers.ts'],
    referenceEdits: {
      '/src/utils/todoHelpers.ts': `type Todo = { id: string; text: string; done: boolean };

export function addTodo(todos: Todo[], text: string) {
  return [
    ...todos,
    {
      id: String(todos.length + 1),
      text,
      done: false
    }
  ];
}

export function toggleTodo(todos: Todo[], id: string) {
  return todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          done: !todo.done
        }
      : todo
  );
}`
    }
  }),
  createSeed({
    id: 'react-debug-editable-list-keys',
    title: 'Editing the Wrong Row After Reordering',
    difficulty: 'medium',
    topics: ['reconciliation', 'list keys', 'forms'],
    bugTypes: ['bad key usage'],
    briefMarkdown: `### Scenario
A reorderable editable list is used in an interview exercise to simulate debugging unfamiliar UI state bugs.

### Reported issue
After reordering, inserting, or deleting rows, edits appear to move to the wrong logical item.

### Expected behavior
Each row should keep its own local input and edit mode state across list operations.

### Observed behavior
Input state and edit mode are reused on the wrong rows.

### Constraints
- Keep row-local UI state
- Fix the bug without rewriting the list architecture`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { EditableList } from './components/EditableList';

export default function App() {
  return <EditableList />;
}`
        },
        {
          path: '/src/components/EditableList.tsx',
          language: 'tsx',
          editable: true,
          contents: `import React from 'react';
import { EditableRow } from './EditableRow';
import { initialItems } from '../data/mockItems';

export function EditableList() {
  const [items, setItems] = React.useState(initialItems);

  return (
    <div>
      <button onClick={() => setItems([...items].reverse())}>Reverse order</button>
      <button
        onClick={() =>
          setItems([
            { id: 'new-item', label: 'Inserted item' },
            ...items
          ])
        }
      >
        Insert first
      </button>
      <button onClick={() => setItems(items.slice(1))}>Delete first</button>
      <div>
        {items.map((item, index) => (
          <EditableRow key={index} item={item} />
        ))}
      </div>
    </div>
  );
}`
        },
        {
          path: '/src/components/EditableRow.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';

export function EditableRow({ item }: { item: { id: string; label: string } }) {
  const [value, setValue] = React.useState(item.label);
  const [editing, setEditing] = React.useState(false);

  return (
    <div>
      <button onClick={() => setEditing((current) => !current)}>
        {editing ? \`Done \${item.label}\` : \`Edit \${item.label}\`}
      </button>
      <input
        aria-label={item.label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <span data-testid={\`editing-\${item.id}\`}>{editing ? 'editing' : 'idle'}</span>
    </div>
  );
}`
        },
        {
          path: '/src/data/mockItems.ts',
          language: 'ts',
          editable: false,
          contents: `export const initialItems = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' }
];`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'editing a row keeps its value after reorder',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('Alpha'), { target: { value: 'Alpha edited' } });
      fireEvent.click(screen.getByText('Reverse order'));
      expect(screen.getByLabelText('Alpha')).toHaveValue('Alpha edited');
    }
  },
  {
    name: 'inserting a new row does not shift existing controlled state',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('Beta'), { target: { value: 'Beta edited' } });
      fireEvent.click(screen.getByText('Insert first'));
      expect(screen.getByLabelText('Beta')).toHaveValue('Beta edited');
    }
  },
  {
    name: 'deleting an item preserves other rows correctly',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('Gamma'), { target: { value: 'Gamma edited' } });
      fireEvent.click(screen.getByText('Delete first'));
      expect(screen.getByLabelText('Gamma')).toHaveValue('Gamma edited');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'edit mode stays attached to the correct logical item',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Edit Beta'));
      fireEvent.click(screen.getByText('Reverse order'));
      expect(screen.getByTestId('editing-b')).toHaveTextContent('editing');
      expect(screen.getByTestId('editing-a')).toHaveTextContent('idle');
    }
  },
  {
    name: 'reorder plus edit sequence remains stable',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Reverse order'));
      fireEvent.change(screen.getByLabelText('Gamma'), { target: { value: 'Gamma newest' } });
      fireEvent.click(screen.getByText('Insert first'));
      expect(screen.getByLabelText('Gamma')).toHaveValue('Gamma newest');
    }
  }
];`
    },
    reproductionHints: [
      'Edit one row, then reverse the list.',
      'Try inserting a new row at the top after editing an existing item.',
      'Row-local state is intentional, so focus on how React matches rows over time.'
    ],
    maintainabilityNotes: [
      'Dynamic lists should use stable identity keys, not array positions.',
      'Preserving row-local state correctly is a reconciliation concern, not a form-state rewrite problem.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The list used the array index as the row key, so React reused row component instances for different logical items after reorder, insert, and delete operations.',
      fixSummaryMarkdown: 'Use the item id as the key so React preserves each row’s local state with the correct logical item.',
      edgeCasesMarkdown: 'Editing state, focus, and input text should remain attached to the same item across insertions and reorder operations. A reviewer should be suspicious of index keys in any dynamic list.'
    },
    recallQuestions: [
      'Why do unstable keys scramble row-local state?',
      'When is an index key safe, and when is it not?'
    ],
    metadata: { estimatedMinutes: 10 },
    allowedEditablePaths: ['/src/components/EditableList.tsx'],
    referenceEdits: {
      '/src/components/EditableList.tsx': `import React from 'react';
import { EditableRow } from './EditableRow';
import { initialItems } from '../data/mockItems';

export function EditableList() {
  const [items, setItems] = React.useState(initialItems);

  return (
    <div>
      <button onClick={() => setItems([...items].reverse())}>Reverse order</button>
      <button
        onClick={() =>
          setItems([
            { id: 'new-item', label: 'Inserted item' },
            ...items
          ])
        }
      >
        Insert first
      </button>
      <button onClick={() => setItems(items.slice(1))}>Delete first</button>
      <div>
        {items.map((item) => (
          <EditableRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}`
    }
  }),
  createSeed({
    id: 'react-debug-settings-controlled',
    title: 'Form Field Resets and Emits Warnings',
    difficulty: 'medium',
    topics: ['forms', 'controlled inputs', 'initial state'],
    bugTypes: ['controlled/uncontrolled mismatch'],
    briefMarkdown: `### Scenario
A settings form loads data asynchronously and lets users edit a display name field.

### Reported issue
The display name input does not reliably populate after load, and editing can feel inconsistent after the form re-renders.

### Expected behavior
The field should be controlled from the first render, populate once data arrives, and keep user edits stable.

### Observed behavior
The input behaves like an uncontrolled field during initialization, then later receives state updates.

### Constraints
- Keep the existing hook and form split
- Fix initialization and field wiring with the smallest maintainable change`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { SettingsForm } from './components/SettingsForm';

export default function App() {
  const [refreshTick, setRefreshTick] = React.useState(0);

  return (
    <div>
      <button onClick={() => setRefreshTick((value) => value + 1)}>Force rerender</button>
      <p data-testid="refresh-tick">{refreshTick}</p>
      <SettingsForm />
    </div>
  );
}`
        },
        {
          path: '/src/components/SettingsForm.tsx',
          language: 'tsx',
          editable: true,
          contents: `import React from 'react';
import { useSettings } from '../hooks/useSettings';

export function SettingsForm() {
  const { displayName, setDisplayName, reloadMissing, reloadBlank } = useSettings();

  return (
    <section>
      <button onClick={reloadMissing}>Reload missing</button>
      <button onClick={reloadBlank}>Reload blank</button>
      <input
        aria-label="display name"
        defaultValue={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <p data-testid="display-name-state">{displayName === '' ? 'blank' : displayName}</p>
    </section>
  );
}`
        },
        {
          path: '/src/hooks/useSettings.ts',
          language: 'ts',
          editable: false,
          contents: `import React from 'react';
import { fakeSettings } from '../api/fakeSettings';

export function useSettings() {
  const [displayName, setDisplayName] = React.useState<string | undefined>(undefined);

  const load = React.useCallback(async (mode: 'default' | 'missing' | 'blank') => {
    const settings = await fakeSettings(mode);
    setDisplayName(settings.displayName);
  }, []);

  React.useEffect(() => {
    void load('default');
  }, [load]);

  return {
    displayName,
    setDisplayName,
    reloadMissing: () => void load('missing'),
    reloadBlank: () => void load('blank')
  };
}`
        },
        {
          path: '/src/api/fakeSettings.ts',
          language: 'ts',
          editable: false,
          contents: `export async function fakeSettings(mode: 'default' | 'missing' | 'blank') {
  await new Promise((resolve) => setTimeout(resolve, 10));

  if (mode === 'missing') return {} as { displayName?: string };
  if (mode === 'blank') return { displayName: '' };

  return { displayName: 'Ada Admin' };
}`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const tests = [
  {
    name: 'initial async load populates the value correctly',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(15);
      });
      expect(screen.getByLabelText('display name')).toHaveValue('Ada Admin');
    }
  },
  {
    name: 'field is editable after load',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(15);
      });
      const input = screen.getByLabelText('display name');
      fireEvent.change(input, { target: { value: 'Grace Hopper' } });
      expect(input).toHaveValue('Grace Hopper');
    }
  },
  {
    name: 'typed changes persist in component state across rerenders',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await wait(15);
      });
      const input = screen.getByLabelText('display name');
      fireEvent.change(input, { target: { value: 'Linus Reviewer' } });
      fireEvent.click(screen.getByText('Force rerender'));
      expect(screen.getByTestId('display-name-state')).toHaveTextContent('Linus Reviewer');
      expect(input).toHaveValue('Linus Reviewer');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const tests = [
  {
    name: 'missing async field falls back to an empty controlled value',
    run: async () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Reload missing'));
      await act(async () => {
        await wait(15);
      });
      expect(screen.getByLabelText('display name')).toHaveValue('');
      expect(screen.getByTestId('display-name-state')).toHaveTextContent('blank');
    }
  },
  {
    name: 'empty string values behave correctly',
    run: async () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Reload blank'));
      await act(async () => {
        await wait(15);
      });
      const input = screen.getByLabelText('display name');
      expect(input).toHaveValue('');
      fireEvent.change(input, { target: { value: 'Recovery value' } });
      expect(input).toHaveValue('Recovery value');
    }
  }
];`
    },
    reproductionHints: [
      'Wait for the async settings load to finish before typing.',
      'Force a rerender after typing to see whether the field stays in sync.',
      'The hook owns the loaded state, but the form decides how the input is wired.'
    ],
    maintainabilityNotes: [
      'Inputs that derive from React state should stay controlled from the first render onward.',
      'Missing async fields should be normalized near the UI boundary instead of leaking `undefined` into inputs.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The form used `defaultValue`, so the input behaved like an uncontrolled field during async initialization and ignored later state updates.',
      fixSummaryMarkdown: 'Bind the input with `value={displayName ?? ""}` so it stays controlled and always reflects the latest state.',
      edgeCasesMarkdown: 'Missing optional fields and explicit empty strings should both render as a stable blank value. A reviewer should look for `defaultValue` when state is expected to drive the input.'
    },
    recallQuestions: [
      'What makes an input controlled versus uncontrolled in React?',
      'Why does `defaultValue` break async form hydration here?'
    ],
    metadata: { estimatedMinutes: 10 },
    allowedEditablePaths: ['/src/components/SettingsForm.tsx'],
    referenceEdits: {
      '/src/components/SettingsForm.tsx': `import React from 'react';
import { useSettings } from '../hooks/useSettings';

export function SettingsForm() {
  const { displayName, setDisplayName, reloadMissing, reloadBlank } = useSettings();

  return (
    <section>
      <button onClick={reloadMissing}>Reload missing</button>
      <button onClick={reloadBlank}>Reload blank</button>
      <input
        aria-label="display name"
        value={displayName ?? ''}
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <p data-testid="display-name-state">{displayName === '' || displayName === undefined ? 'blank' : displayName}</p>
    </section>
  );
}`
    }
  }),
  createSeed({
    id: 'react-debug-filter-loop',
    title: 'Filters Trigger Endless Re-render',
    difficulty: 'hard',
    topics: ['useEffect', 'dependency arrays', 'referential equality', 'memoization'],
    bugTypes: ['infinite re-render'],
    briefMarkdown: `### Scenario
A filtered results panel derives visible items in a hook and records how many times it renders.

### Reported issue
The panel pegs the CPU and repeatedly recomputes filtered results unless the bug is fixed.

### Expected behavior
Derived filtering should run once per meaningful filter change.

### Observed behavior
The hook depends on an unstable object created every render, which retriggers an effect that also updates state.

### Constraints
- Keep the current hook-based data flow
- Stabilize the dependency path with a minimal change`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { FilterPanel } from './components/FilterPanel';

export default function App() {
  return <FilterPanel />;
}`
        },
        {
          path: '/src/components/FilterPanel.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { useFilteredResults } from '../hooks/useFilteredResults';
import { recordFilterPanelRender, getFilterPanelRenderCount } from '../utils/filterUtils';

const allItems = [
  { id: '1', label: 'Open bug', open: true },
  { id: '2', label: 'Closed bug', open: false },
  { id: '3', label: 'Open review', open: true }
];

export function FilterPanel() {
  recordFilterPanelRender();
  const [query, setQuery] = React.useState('bug');
  const [onlyOpen, setOnlyOpen] = React.useState(false);
  const results = useFilteredResults(allItems, query, onlyOpen);

  return (
    <section>
      <input aria-label="filter query" value={query} onChange={(event) => setQuery(event.target.value)} />
      <label>
        <input
          aria-label="only open"
          type="checkbox"
          checked={onlyOpen}
          onChange={(event) => setOnlyOpen(event.target.checked)}
        />
        only open
      </label>
      <p data-testid="filter-render-count">{getFilterPanelRenderCount()}</p>
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </section>
  );
}`
        },
        {
          path: '/src/hooks/useFilteredResults.ts',
          language: 'ts',
          editable: true,
          contents: `import React from 'react';
import { applyFilters } from '../utils/filterUtils';

type Item = { id: string; label: string; open: boolean };

export function useFilteredResults(items: Item[], query: string, onlyOpen: boolean) {
  const [results, setResults] = React.useState<Item[]>([]);
  const criteria = { query, onlyOpen };
  const loopGuard = React.useRef(0);

  React.useEffect(() => {
    loopGuard.current += 1;
    if (loopGuard.current > 25) {
      throw new Error('Loop detected');
    }

    setResults(applyFilters(items, criteria));
  }, [items, criteria]);

  return results;
}`
        },
        {
          path: '/src/utils/filterUtils.ts',
          language: 'ts',
          editable: false,
          contents: `type Item = { id: string; label: string; open: boolean };

let filterPanelRenderCount = 0;

export const recordFilterPanelRender = () => {
  filterPanelRenderCount += 1;
};

export const getFilterPanelRenderCount = () => filterPanelRenderCount;

export const applyFilters = (items: Item[], criteria: { query: string; onlyOpen: boolean }) => {
  return items.filter((item) => {
    const matchesQuery = item.label.toLowerCase().includes(criteria.query.toLowerCase());
    return criteria.onlyOpen ? matchesQuery && item.open : matchesQuery;
  });
};`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'filtered results render correctly',
    run: () => {
      render(React.createElement(App));
      expect(screen.getByText('Open bug')).toBeTruthy();
      expect(screen.getByText('Closed bug')).toBeTruthy();
    }
  },
  {
    name: 'no repeated loop after initial render',
    run: () => {
      render(React.createElement(App));
      expect(Number(screen.getByTestId('filter-render-count').textContent)).toBe(2);
    }
  },
  {
    name: 'changing filters updates results once as expected',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByLabelText('only open'));
      expect(screen.getByText('Open bug')).toBeTruthy();
      expect(screen.queryByText('Closed bug')).toBeFalsy();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'same filter values do not retrigger unnecessary state churn',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('filter query'), { target: { value: 'bug' } });
      expect(screen.getByTestId('filter-render-count')).toHaveTextContent('2');
    }
  },
  {
    name: 'rerender count stays under the expected threshold',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('filter query'), { target: { value: 'open' } });
      expect(Number(screen.getByTestId('filter-render-count').textContent)).toBe(4);
    }
  }
];`
    },
    reproductionHints: [
      'Run the panel and inspect whether it stabilizes after the first render.',
      'Look for derived state being recomputed inside an effect.',
      'If an effect depends on an object created during render, inspect its identity.'
    ],
    maintainabilityNotes: [
      'Derived state effects should depend on stable values, not freshly recreated objects.',
      'If an effect sets state, be extra suspicious of dependencies that change every render.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The hook recreated a `criteria` object on every render, then used it as an effect dependency. Because the effect also set state, React immediately re-rendered and saw a new object again.',
      fixSummaryMarkdown: 'Stabilize the criteria object or depend directly on primitive inputs so the effect only runs when the actual filter values change.',
      edgeCasesMarkdown: 'Re-entering the same filter values should not churn state. A reviewer should watch for object and function dependencies in effects that set derived state.'
    },
    recallQuestions: [
      'Why does a freshly created object in a dependency array retrigger effects?',
      'What is the smallest way to make this dependency path stable?'
    ],
    metadata: { estimatedMinutes: 12 },
    allowedEditablePaths: ['/src/hooks/useFilteredResults.ts'],
    referenceEdits: {
      '/src/hooks/useFilteredResults.ts': `import React from 'react';
import { applyFilters } from '../utils/filterUtils';

type Item = { id: string; label: string; open: boolean };

export function useFilteredResults(items: Item[], query: string, onlyOpen: boolean) {
  const [results, setResults] = React.useState<Item[]>([]);
  const criteria = React.useMemo(() => ({ query, onlyOpen }), [query, onlyOpen]);
  const loopGuard = React.useRef(0);

  React.useEffect(() => {
    loopGuard.current += 1;
    if (loopGuard.current > 25) {
      throw new Error('Loop detected');
    }

    setResults(applyFilters(items, criteria));
  }, [items, criteria]);

  return results;
}`
    }
  }),
  createSeed({
    id: 'react-debug-escape-leak',
    title: 'Escape Key Fires Multiple Times',
    difficulty: 'medium',
    topics: ['lifecycle', 'cleanup', 'effects', 'event listeners'],
    bugTypes: ['event leak'],
    briefMarkdown: `### Scenario
A modal should close on Escape. The app tracks how many times the close callback fires so duplicate listeners are easy to spot.

### Reported issue
After opening and closing the modal several times, pressing Escape triggers the close path more than once.

### Expected behavior
One active Escape listener while the modal is open, and none when it is closed.

### Observed behavior
Listeners accumulate across mount and unmount cycles.

### Constraints
- Keep the current hook abstraction
- Fix the cleanup symmetry rather than rewriting the modal`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { Modal } from './components/Modal';

export default function App() {
  const [open, setOpen] = React.useState(true);
  const [closeCount, setCloseCount] = React.useState(0);

  const closeModal = React.useCallback(() => {
    setOpen(false);
    setCloseCount((count) => count + 1);
  }, []);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open modal</button>
      <p data-testid="close-count">{closeCount}</p>
      {open ? <Modal onClose={closeModal} /> : <p data-testid="modal-closed">closed</p>}
    </div>
  );
}`
        },
        {
          path: '/src/components/Modal.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { useEscapeToClose } from '../hooks/useEscapeToClose';

export function Modal({ onClose }: { onClose: () => void }) {
  useEscapeToClose(onClose);

  return (
    <div role="dialog">
      <p data-testid="modal-open">open</p>
      <button onClick={onClose}>Close now</button>
    </div>
  );
}`
        },
        {
          path: '/src/hooks/useEscapeToClose.ts',
          language: 'ts',
          editable: true,
          contents: `import React from 'react';

export function useEscapeToClose(onClose: () => void) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
  }, [onClose]);
}`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'escape closes the modal once',
    run: () => {
      render(React.createElement(App));
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.getByTestId('close-count')).toHaveTextContent('1');
      expect(screen.getByTestId('modal-closed')).toHaveTextContent('closed');
    }
  },
  {
    name: 'reopening does not duplicate handler behavior',
    run: () => {
      render(React.createElement(App));
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.click(screen.getByText('Open modal'));
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.getByTestId('close-count')).toHaveTextContent('2');
    }
  },
  {
    name: 'explicit close button still works',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Close now'));
      expect(screen.getByTestId('close-count')).toHaveTextContent('1');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'repeated mount and unmount cycles remain clean',
    run: () => {
      render(React.createElement(App));
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.click(screen.getByText('Open modal'));
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.click(screen.getByText('Open modal'));
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.getByTestId('close-count')).toHaveTextContent('3');
    }
  },
  {
    name: 'listener is not active while the modal is closed',
    run: () => {
      render(React.createElement(App));
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.getByTestId('close-count')).toHaveTextContent('1');
    }
  }
];`
    },
    reproductionHints: [
      'Open and close the modal multiple times.',
      'Use the Escape key rather than only the close button.',
      'The listener logic is encapsulated in the custom hook.'
    ],
    maintainabilityNotes: [
      'Event subscriptions need matching cleanup inside the same effect.',
      'Stable listener lifecycle matters more than moving the logic into a different component.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The Escape listener was added every time the modal mounted, but it was never removed when the modal unmounted.',
      fixSummaryMarkdown: 'Return a cleanup function from the effect that removes the same listener from `window`.',
      edgeCasesMarkdown: 'Repeated open and close cycles should never accumulate extra listeners. A reviewer should verify both the subscription and the cleanup use the same handler identity.'
    },
    recallQuestions: [
      'Why does reopening the modal make Escape fire multiple times?',
      'What is the minimal cleanup pattern for DOM listeners in React effects?'
    ],
    metadata: { estimatedMinutes: 9 },
    allowedEditablePaths: ['/src/hooks/useEscapeToClose.ts'],
    referenceEdits: {
      '/src/hooks/useEscapeToClose.ts': `import React from 'react';

export function useEscapeToClose(onClose: () => void) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);
}`
    }
  }),
  createSeed({
    id: 'react-debug-summary-stale-memo',
    title: 'Memoized Summary Is Stale',
    difficulty: 'medium',
    topics: ['useMemo', 'useCallback', 'derived state', 'performance'],
    bugTypes: ['incorrect memoization'],
    briefMarkdown: `### Scenario
A summary panel derives totals from a transaction list. The dashboard uses a hook so the logic is easy to reuse.

### Reported issue
Adding new transactions updates the list, but the memoized summary can stay stale.

### Expected behavior
The summary should always reflect the latest transactions and selected filters.

### Observed behavior
The memoized summary misses one of its reactive inputs.

### Constraints
- Keep the current summary hook
- Make a focused dependency fix`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { SummaryPanel } from './components/SummaryPanel';
import { TransactionList } from './components/TransactionList';

type Transaction = { id: string; amount: number; type: 'deposit' | 'withdrawal' };

export default function App() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([
    { id: '1', amount: 10, type: 'deposit' }
  ]);
  const [selectedType, setSelectedType] = React.useState<'all' | 'deposit' | 'withdrawal'>('all');

  return (
    <div>
      <button onClick={() => setSelectedType('all')}>Show all</button>
      <button onClick={() => setSelectedType('deposit')}>Show deposits</button>
      <button onClick={() => setSelectedType('withdrawal')}>Show withdrawals</button>
      <TransactionList transactions={transactions} setTransactions={setTransactions} />
      <SummaryPanel transactions={transactions} selectedType={selectedType} />
    </div>
  );
}`
        },
        {
          path: '/src/components/TransactionList.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';

type Transaction = { id: string; amount: number; type: 'deposit' | 'withdrawal' };

export function TransactionList({
  transactions,
  setTransactions
}: {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}) {
  return (
    <div>
      <button
        onClick={() =>
          setTransactions((current) => [
            ...current,
            { id: String(current.length + 1), amount: 5, type: 'deposit' }
          ])
        }
      >
        Add deposit
      </button>
      <button
        onClick={() =>
          setTransactions((current) => [
            ...current,
            { id: String(current.length + 1), amount: 3, type: 'withdrawal' }
          ])
        }
      >
        Add withdrawal
      </button>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.type}:{transaction.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}`
        },
        {
          path: '/src/components/SummaryPanel.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { useSummary } from '../hooks/useSummary';

type Transaction = { id: string; amount: number; type: 'deposit' | 'withdrawal' };

export function SummaryPanel({
  transactions,
  selectedType
}: {
  transactions: Transaction[];
  selectedType: 'all' | 'deposit' | 'withdrawal';
}) {
  const summary = useSummary(transactions, selectedType);

  return (
    <section>
      <p data-testid="summary-total">{summary.total}</p>
      <p data-testid="summary-count">{summary.count}</p>
      <p data-testid="summary-label">{summary.label}</p>
    </section>
  );
}`
        },
        {
          path: '/src/hooks/useSummary.ts',
          language: 'ts',
          editable: true,
          contents: `import React from 'react';

type Transaction = { id: string; amount: number; type: 'deposit' | 'withdrawal' };

export function useSummary(
  transactions: Transaction[],
  selectedType: 'all' | 'deposit' | 'withdrawal'
) {
  return React.useMemo(() => {
    const visible =
      selectedType === 'all'
        ? transactions
        : transactions.filter((transaction) => transaction.type === selectedType);

    return {
      total: visible.reduce((sum, transaction) => sum + transaction.amount, 0),
      count: visible.length,
      label: selectedType
    };
  }, [selectedType]);
}`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'summary updates when source data changes',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Add deposit'));
      expect(screen.getByTestId('summary-total')).toHaveTextContent('15');
      expect(screen.getByTestId('summary-count')).toHaveTextContent('2');
    }
  },
  {
    name: 'memoized behavior does not return stale output after filter changes',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Add withdrawal'));
      fireEvent.click(screen.getByText('Show withdrawals'));
      expect(screen.getByTestId('summary-total')).toHaveTextContent('3');
      expect(screen.getByTestId('summary-label')).toHaveTextContent('withdrawal');
    }
  },
  {
    name: 'interactions still work after updating the list',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Add deposit'));
      fireEvent.click(screen.getByText('Show deposits'));
      expect(screen.getByTestId('summary-total')).toHaveTextContent('15');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'child-triggered additions use fresh summary values',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Add withdrawal'));
      fireEvent.click(screen.getByText('Add withdrawal'));
      fireEvent.click(screen.getByText('Show all'));
      expect(screen.getByTestId('summary-total')).toHaveTextContent('16');
      expect(screen.getByTestId('summary-count')).toHaveTextContent('3');
    }
  },
  {
    name: 'changing relevant inputs invalidates the memo correctly',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Show deposits'));
      fireEvent.click(screen.getByText('Add deposit'));
      expect(screen.getByTestId('summary-total')).toHaveTextContent('15');
      expect(screen.getByTestId('summary-count')).toHaveTextContent('2');
    }
  }
];`
    },
    reproductionHints: [
      'Start by adding a new transaction and comparing the list with the summary.',
      'Then switch filters to see whether the derived values recompute when they should.',
      'The derived logic is centralized in the custom hook.'
    ],
    maintainabilityNotes: [
      'Memoized derived values must list every reactive input used in the calculation.',
      'Keep the optimization, but ensure it never returns stale business data.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The summary hook memoized its result based only on `selectedType`, so list updates left the memoized summary stale.',
      fixSummaryMarkdown: 'Include `transactions` in the `useMemo` dependency list so the summary recomputes when the source data changes.',
      edgeCasesMarkdown: 'List updates and filter changes should both invalidate the summary. A reviewer should verify that every value read inside the memo appears in the dependency list.'
    },
    recallQuestions: [
      'Why can a memoized summary stay stale even when the list rerenders correctly?',
      'How do you decide which values belong in a `useMemo` dependency array?'
    ],
    metadata: { estimatedMinutes: 9 },
    allowedEditablePaths: ['/src/hooks/useSummary.ts'],
    referenceEdits: {
      '/src/hooks/useSummary.ts': `import React from 'react';

type Transaction = { id: string; amount: number; type: 'deposit' | 'withdrawal' };

export function useSummary(
  transactions: Transaction[],
  selectedType: 'all' | 'deposit' | 'withdrawal'
) {
  return React.useMemo(() => {
    const visible =
      selectedType === 'all'
        ? transactions
        : transactions.filter((transaction) => transaction.type === selectedType);

    return {
      total: visible.reduce((sum, transaction) => sum + transaction.amount, 0),
      count: visible.length,
      label: selectedType
    };
  }, [transactions, selectedType]);
}`
    }
  }),
  createSeed({
    id: 'react-debug-context-rerender',
    title: 'Typing in Search Causes Unrelated Panels to Re-render',
    difficulty: 'hard',
    topics: ['context', 'provider values', 'render performance', 'memoization'],
    bugTypes: ['performance regression'],
    briefMarkdown: `### Scenario
A search box lives beside an app-wide context provider. Typing in the box should not rerender unrelated context consumers unless the context data changes.

### Reported issue
The app feels sluggish while typing because unrelated panels rerender even though their context values did not change.

### Expected behavior
Search input behavior should remain correct, and unrelated context consumers should stay stable during typing.

### Observed behavior
The provider recreates its value object every parent render.

### Constraints
- Keep the existing context shape
- Fix the provider value with a minimal maintainable change`,
    codebase: {
      files: [
        {
          path: '/src/App.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { AppProvider } from './context/AppContext';
import { SearchPanel } from './components/SearchPanel';
import { StatsPanel } from './components/StatsPanel';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [query, setQuery] = React.useState('');

  return (
    <AppProvider>
      <SearchPanel query={query} setQuery={setQuery} />
      <StatsPanel />
      <Sidebar />
    </AppProvider>
  );
}`
        },
        {
          path: '/src/context/AppContext.tsx',
          language: 'tsx',
          editable: true,
          contents: `import React from 'react';

export const AppContext = React.createContext({
  sidebarOpen: true,
  toggleSidebar: () => {},
  statsTotal: 3
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const statsTotal = 3;
  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((current) => !current);
  }, []);

  return (
    <AppContext.Provider value={{ sidebarOpen, toggleSidebar, statsTotal }}>
      {children}
    </AppContext.Provider>
  );
}`
        },
        {
          path: '/src/components/SearchPanel.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';

export function SearchPanel({
  query,
  setQuery
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <section>
      <input
        aria-label="search query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p data-testid="search-value">{query}</p>
    </section>
  );
}`
        },
        {
          path: '/src/components/StatsPanel.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { AppContext } from '../context/AppContext';
import { bumpStatsPanelRender, getStatsPanelRenderCount } from '../utils/renderCounters';

export const StatsPanel = React.memo(function StatsPanel() {
  bumpStatsPanelRender();
  const { statsTotal } = React.useContext(AppContext);

  return (
    <section>
      <p data-testid="stats-total">{statsTotal}</p>
      <p data-testid="stats-renders">{getStatsPanelRenderCount()}</p>
    </section>
  );
});`
        },
        {
          path: '/src/components/Sidebar.tsx',
          language: 'tsx',
          editable: false,
          contents: `import React from 'react';
import { AppContext } from '../context/AppContext';
import { bumpSidebarRender, getSidebarRenderCount } from '../utils/renderCounters';

export const Sidebar = React.memo(function Sidebar() {
  bumpSidebarRender();
  const { sidebarOpen, toggleSidebar } = React.useContext(AppContext);

  return (
    <aside>
      <button onClick={toggleSidebar}>Toggle sidebar</button>
      <p data-testid="sidebar-state">{sidebarOpen ? 'open' : 'closed'}</p>
      <p data-testid="sidebar-renders">{getSidebarRenderCount()}</p>
    </aside>
  );
});`
        },
        {
          path: '/src/utils/renderCounters.ts',
          language: 'ts',
          editable: false,
          contents: `let statsPanelRenders = 0;
let sidebarRenders = 0;

export const bumpStatsPanelRender = () => {
  statsPanelRenders += 1;
};

export const getStatsPanelRenderCount = () => statsPanelRenders;

export const bumpSidebarRender = () => {
  sidebarRenders += 1;
};

export const getSidebarRenderCount = () => sidebarRenders;`
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'functional behavior still works while typing',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search query'), { target: { value: 'react' } });
      expect(screen.getByTestId('search-value')).toHaveTextContent('react');
    }
  },
  {
    name: 'unrelated stats panel does not rerender during typing',
    run: () => {
      render(React.createElement(App));
      expect(screen.getByTestId('stats-renders')).toHaveTextContent('1');
      fireEvent.change(screen.getByLabelText('search query'), { target: { value: 'r' } });
      expect(screen.getByTestId('stats-renders')).toHaveTextContent('1');
    }
  },
  {
    name: 'context consumers still receive updated values correctly',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Toggle sidebar'));
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'only relevant changes propagate to unrelated consumers',
    run: () => {
      render(React.createElement(App));
      fireEvent.change(screen.getByLabelText('search query'), { target: { value: 're' } });
      fireEvent.change(screen.getByLabelText('search query'), { target: { value: 'rea' } });
      expect(screen.getByTestId('sidebar-renders')).toHaveTextContent('1');
      expect(screen.getByTestId('stats-renders')).toHaveTextContent('1');
    }
  },
  {
    name: 'provider fix does not freeze stale values',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Toggle sidebar'));
      fireEvent.click(screen.getByText('Toggle sidebar'));
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open');
    }
  }
];`
    },
    reproductionHints: [
      'Type in the search input and watch the consumer render counters.',
      'SearchPanel itself is expected to rerender; the question is whether unrelated context consumers do too.',
      'The provider lives in its own file and is the likely source of the churn.'
    ],
    maintainabilityNotes: [
      'Context provider values should stay referentially stable when their contents have not changed.',
      'This is a provider concern, not a reason to rewrite every consumer.'
    ],
    solutionNotes: {
      rootCauseMarkdown: 'The provider created a fresh value object on every parent render, so all context consumers rerendered even when the actual context data stayed the same.',
      fixSummaryMarkdown: 'Memoize the provider value so typing in the sibling search panel does not propagate unrelated rerenders through context.',
      edgeCasesMarkdown: 'Actual context updates, like toggling the sidebar, should still propagate immediately. A reviewer should verify the provider memo includes every reactive field it exposes.'
    },
    recallQuestions: [
      'Why can a parent rerender force all context consumers to rerender even if context data is unchanged?',
      'What is the minimal provider-level fix for this pattern?'
    ],
    metadata: { estimatedMinutes: 12 },
    allowedEditablePaths: ['/src/context/AppContext.tsx'],
    referenceEdits: {
      '/src/context/AppContext.tsx': `import React from 'react';

export const AppContext = React.createContext({
  sidebarOpen: true,
  toggleSidebar: () => {},
  statsTotal: 3
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const statsTotal = 3;
  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((current) => !current);
  }, []);
  const value = React.useMemo(
    () => ({
      sidebarOpen,
      toggleSidebar,
      statsTotal
    }),
    [sidebarOpen, toggleSidebar, statsTotal]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}`
    }
  })
] satisfies SeedChallenge[];

for (const seed of seeds) {
  if (countTestNames(seed.tests.visible) < 3) {
    throw new Error(`${seed.id} must include at least 3 visible tests.`);
  }
  if (countTestNames(seed.tests.hidden) < 2) {
    throw new Error(`${seed.id} must include at least 2 hidden tests.`);
  }
}

export const reactDebuggingProblems: ReactDebuggingProblem[] = seeds.map(({ referenceEdits, ...problem }) => problem);

export const reactDebuggingReferenceEdits: Record<string, Record<string, string>> = Object.fromEntries(
  seeds.map((seed) => [seed.id, seed.referenceEdits])
);
