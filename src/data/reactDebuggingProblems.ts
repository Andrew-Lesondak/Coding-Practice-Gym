import { ReactDebuggingProblem } from '../types/reactDebugging';

const appFile = (contents: string, editable = true) => ({
  path: '/src/App.tsx',
  language: 'tsx' as const,
  contents,
  editable
});

const problem = (input: ReactDebuggingProblem): ReactDebuggingProblem => input;

export const reactDebuggingProblems: ReactDebuggingProblem[] = [
  problem({
    id: 'react-debug-effect-stale-profile',
    title: 'Profile Pane Shows Stale User Data',
    difficulty: 'easy',
    topics: ['effects', 'state', 'async'],
    bugTypes: ['missing dependency'],
    briefMarkdown:
      '### Scenario\nA profile panel reloads when the selected user changes.\n\n### Reported issue\nSwitching users still shows the first user\'s data.\n\n### Expected\nThe panel refetches whenever the selected user id changes.\n\n### Observed\nThe effect runs only on mount.\n\n### Constraints\nMake the smallest fix. Do not rewrite the hook.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { ProfileCard } from './ProfileCard';

export default function App() {
  const [userId, setUserId] = React.useState('1');
  return (
    <div>
      <button onClick={() => setUserId('1')}>User 1</button>
      <button onClick={() => setUserId('2')}>User 2</button>
      <ProfileCard userId={userId} />
    </div>
  );
}`),
        {
          path: '/src/ProfileCard.tsx',
          language: 'tsx',
          contents: `import React from 'react';
import { fetchUser } from './api';

export function ProfileCard({ userId }: { userId: string }) {
  const [name, setName] = React.useState('loading');

  React.useEffect(() => {
    setName(fetchUser(userId).name);
  }, []);

  return <p data-testid="name">{name}</p>;
}`,
          editable: true
        },
        {
          path: '/src/api.ts',
          language: 'ts',
          contents: `const users: Record<string, { name: string }> = {
  '1': { name: 'Ada' },
  '2': { name: 'Grace' }
};

export const fetchUser = (userId: string) => users[userId];`,
          editable: false
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
    name: 'switching users updates the rendered profile',
    run: () => {
      render(React.createElement(App));
      expect(screen.getByTestId('name')).toHaveTextContent('Ada');
      fireEvent.click(screen.getByText('User 2'));
      expect(screen.getByTestId('name')).toHaveTextContent('Grace');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'switching back reuses the current id instead of stale state',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('User 2'));
      fireEvent.click(screen.getByText('User 1'));
      expect(screen.getByTestId('name')).toHaveTextContent('Ada');
    }
  }
];`
    },
    reproductionHints: ['Open the Run tab.', 'Click User 2 after the preview mounts.'],
    maintainabilityNotes: ['Keep the effect dependency list aligned with the values it reads.'],
    solutionNotes: {
      rootCauseMarkdown: 'The effect captured the initial `userId` because the dependency array was empty.',
      fixSummaryMarkdown: 'Include `userId` in the dependency array so the effect refires when the selected user changes.',
      edgeCasesMarkdown: 'Switching back and forth should keep the UI in sync without extra state.'
    },
    recallQuestions: ['Why did the stale user id persist?', 'When should a value be listed in effect dependencies?'],
    metadata: { estimatedMinutes: 8 },
    allowedEditablePaths: ['/src/ProfileCard.tsx']
  }),
  problem({
    id: 'react-debug-stale-interval-counter',
    title: 'Auto Counter Freezes at 1',
    difficulty: 'easy',
    topics: ['stale closures', 'effects'],
    bugTypes: ['stale state'],
    briefMarkdown:
      '### Scenario\nA dashboard counter should tick once per second.\n\n### Reported issue\nIt moves from 0 to 1 and then stops.\n\n### Expected\nThe count keeps increasing while mounted.\n\n### Observed\nThe interval callback uses stale state.\n\n### Constraints\nKeep the interval approach.',
    codebase: {
      files: [
        appFile(`import React from 'react';

export default function App() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setCount(count + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return <p data-testid="count">{count}</p>;
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'interval increments more than once',
    run: async () => {
      render(React.createElement(App));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2200));
      });
      expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThan(1);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Run the app and wait two seconds.'],
    maintainabilityNotes: ['Prefer updater callbacks for state derived from previous state.'],
    solutionNotes: {
      rootCauseMarkdown: 'The interval callback closed over the initial `count` value.',
      fixSummaryMarkdown: 'Use the functional `setCount((current) => current + 1)` form.',
      edgeCasesMarkdown: 'The interval should still clean up correctly on unmount.'
    },
    recallQuestions: ['What value did the interval callback capture?', 'Why does the updater form fix it?'],
    metadata: { estimatedMinutes: 8 }
  }),
  problem({
    id: 'react-debug-mutation-cart',
    title: 'Cart Total Does Not Refresh',
    difficulty: 'easy',
    topics: ['state', 'mutation'],
    bugTypes: ['mutation bug'],
    briefMarkdown:
      '### Scenario\nA mini cart adds one item per click.\n\n### Reported issue\nThe item list sometimes updates, but the total stays stale.\n\n### Expected\nAdding an item should produce a new render and a new total.\n\n### Observed\nState is mutated in place.\n\n### Constraints\nFix the mutation instead of forcing extra renders.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { useCart } from './useCart';

export default function App() {
  const { items, addItem } = useCart();
  return (
    <div>
      <button onClick={() => addItem({ id: String(items.length + 1), price: 5 })}>Add item</button>
      <p data-testid="total">{items.reduce((sum, item) => sum + item.price, 0)}</p>
      <p data-testid="count">{items.length}</p>
    </div>
  );
}`),
        {
          path: '/src/useCart.ts',
          language: 'ts',
          contents: `import React from 'react';

type Item = { id: string; price: number };

export function useCart() {
  const [items, setItems] = React.useState<Item[]>([]);

  const addItem = (item: Item) => {
    items.push(item);
    setItems(items);
  };

  return { items, addItem };
}`,
          editable: true
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
    name: 'adding items updates count and total',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Add item'));
      fireEvent.click(screen.getByText('Add item'));
      expect(screen.getByTestId('count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('10');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Watch the total after two clicks.'],
    maintainabilityNotes: ['React state should be replaced immutably.'],
    solutionNotes: {
      rootCauseMarkdown: 'The hook mutated the existing array and reused the same reference.',
      fixSummaryMarkdown: 'Create a new array before updating state.',
      edgeCasesMarkdown: 'Repeated additions should continue to work without forcing a manual refresh.'
    },
    recallQuestions: ['Why can mutating arrays break rendering?', 'What minimal immutable update was needed?'],
    metadata: { estimatedMinutes: 8 },
    allowedEditablePaths: ['/src/useCart.ts']
  }),
  problem({
    id: 'react-debug-bad-list-keys',
    title: 'Editable Rows Swap Their Draft Text',
    difficulty: 'medium',
    topics: ['list keys', 'forms'],
    bugTypes: ['bad key usage'],
    briefMarkdown:
      '### Scenario\nA reorder button reverses a list of editable rows.\n\n### Reported issue\nDraft text appears to jump to another row after reorder.\n\n### Expected\nEach row keeps its own local input state.\n\n### Observed\nReact reuses component instances because the keys are unstable.\n\n### Constraints\nKeep local row state.',
    codebase: {
      files: [
        appFile(`import React from 'react';

function Row({ label }: { label: string }) {
  const [draft, setDraft] = React.useState(label);
  return <input aria-label={label} value={draft} onChange={(event) => setDraft(event.target.value)} />;
}

export default function App() {
  const [items, setItems] = React.useState([
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' }
  ]);

  return (
    <div>
      <button onClick={() => setItems([...items].reverse())}>Reverse</button>
      {items.map((item, index) => (
        <Row key={index} label={item.label} />
      ))}
    </div>
  );
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'draft text stays with the same logical row after reorder',
    run: () => {
      render(React.createElement(App));
      const alpha = screen.getByLabelText('Alpha');
      fireEvent.change(alpha, { target: { value: 'Alpha edited' } });
      fireEvent.click(screen.getByText('Reverse'));
      expect(screen.getByLabelText('Alpha')).toHaveValue('Alpha edited');
      expect(screen.getByLabelText('Beta')).toHaveValue('Beta');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Type in Alpha, then reverse the list.'],
    maintainabilityNotes: ['List keys should come from stable item identity, not array position.'],
    solutionNotes: {
      rootCauseMarkdown: 'The rows used the array index as the key, so reversing the list reused the wrong component state.',
      fixSummaryMarkdown: 'Use the item id as the key.',
      edgeCasesMarkdown: 'Reordering, inserting, or removing rows should preserve the right local state.'
    },
    recallQuestions: ['Why does key choice affect local component state?', 'When is using an index key unsafe?'],
    metadata: { estimatedMinutes: 10 }
  }),
  problem({
    id: 'react-debug-controlled-input',
    title: 'Search Box Does Not Fully Reset',
    difficulty: 'medium',
    topics: ['forms', 'state'],
    bugTypes: ['controlled/uncontrolled'],
    briefMarkdown:
      '### Scenario\nA small search form supports typing and reset.\n\n### Reported issue\nClicking reset clears React state but leaves the textbox value behind.\n\n### Expected\nReset should clear both the state and the visible input.\n\n### Observed\nThe input is using uncontrolled behavior.\n\n### Constraints\nKeep the same state shape.',
    codebase: {
      files: [
        appFile(`import React from 'react';

export default function App() {
  const [term, setTerm] = React.useState('');

  return (
    <div>
      <input
        aria-label="search"
        defaultValue={term}
        onChange={(event) => setTerm(event.target.value)}
      />
      <button onClick={() => setTerm('')}>Reset</button>
      <p data-testid="term">{term || 'empty'}</p>
    </div>
  );
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'reset clears the textbox and state',
    run: () => {
      render(React.createElement(App));
      const input = screen.getByLabelText('search');
      fireEvent.change(input, { target: { value: 'hooks' } });
      fireEvent.click(screen.getByText('Reset'));
      expect(screen.getByTestId('term')).toHaveTextContent('empty');
      expect(input).toHaveValue('');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Type a value, then press Reset.'],
    maintainabilityNotes: ['If React state owns the value, keep the input controlled.'],
    solutionNotes: {
      rootCauseMarkdown: 'The input was uncontrolled because it used `defaultValue` instead of `value`.',
      fixSummaryMarkdown: 'Bind the input to state with `value={term}`.',
      edgeCasesMarkdown: 'Typing and resetting should stay in sync on every render.'
    },
    recallQuestions: ['What makes an input controlled?', 'Why did state reset but the DOM not reset?'],
    metadata: { estimatedMinutes: 8 }
  }),
  problem({
    id: 'react-debug-async-search-race',
    title: 'Older Search Results Replace Newer Ones',
    difficulty: 'medium',
    topics: ['async', 'effects', 'race conditions'],
    bugTypes: ['race condition'],
    briefMarkdown:
      '### Scenario\nTyping into a search box fetches matching products.\n\n### Reported issue\nA slower earlier request overwrites a faster newer request.\n\n### Expected\nOnly the latest request should win.\n\n### Observed\nResponses apply out of order.\n\n### Constraints\nKeep the async request flow.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { useSearchResults } from './useSearchResults';

export default function App() {
  const [term, setTerm] = React.useState('');
  const results = useSearchResults(term);

  return (
    <div>
      <input aria-label="query" value={term} onChange={(event) => setTerm(event.target.value)} />
      <ul>{results.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}`),
        {
          path: '/src/useSearchResults.ts',
          language: 'ts',
          contents: `import React from 'react';
import { searchProducts } from './searchApi';

export function useSearchResults(term: string) {
  const [results, setResults] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!term) {
      setResults([]);
      return;
    }

    searchProducts(term).then((next) => {
      setResults(next);
    });
  }, [term]);

  return results;
}`,
          editable: true
        },
        {
          path: '/src/searchApi.ts',
          language: 'ts',
          contents: `export async function searchProducts(term: string) {
  const delay = term === 're' ? 30 : 5;
  await new Promise((resolve) => setTimeout(resolve, delay));
  return term === 're' ? ['react', 'redux'] : ['react'];
}`,
          editable: false
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'latest search term wins',
    run: async () => {
      render(React.createElement(App));
      const input = screen.getByLabelText('query');
      fireEvent.change(input, { target: { value: 're' } });
      fireEvent.change(input, { target: { value: 'rea' } });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
      expect(screen.getByText('react')).toBeTruthy();
      expect(screen.queryByText('redux')).toBeFalsy();
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Type quickly from `re` to `rea`.'],
    maintainabilityNotes: ['Guard async effects against stale responses.'],
    solutionNotes: {
      rootCauseMarkdown: 'An older promise resolved later and still called `setResults`.',
      fixSummaryMarkdown: 'Track whether the current effect is still active before committing the response.',
      edgeCasesMarkdown: 'Clearing the search should also ignore any inflight responses.'
    },
    recallQuestions: ['Why do async effects race?', 'What pattern prevents stale promise results from winning?'],
    metadata: { estimatedMinutes: 12 },
    allowedEditablePaths: ['/src/useSearchResults.ts']
  }),
  problem({
    id: 'react-debug-stale-memo-filter',
    title: 'Completed Tasks Filter Stays Outdated',
    difficulty: 'easy',
    topics: ['memoization', 'derived state'],
    bugTypes: ['incorrect memoization'],
    briefMarkdown:
      '### Scenario\nA task list can hide incomplete items.\n\n### Reported issue\nToggling the filter does nothing until another state change happens.\n\n### Expected\nThe visible list should recompute when the filter changes.\n\n### Observed\nMemoized derived data is stale.\n\n### Constraints\nKeep the memoization.',
    codebase: {
      files: [
        appFile(`import React from 'react';

const tasks = [
  { id: '1', title: 'Fix bug', done: true },
  { id: '2', title: 'Write tests', done: false }
];

export default function App() {
  const [showCompletedOnly, setShowCompletedOnly] = React.useState(false);

  const visibleTasks = React.useMemo(() => {
    return showCompletedOnly ? tasks.filter((task) => task.done) : tasks;
  }, []);

  return (
    <div>
      <button onClick={() => setShowCompletedOnly((value) => !value)}>Toggle completed</button>
      <ul>{visibleTasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
    </div>
  );
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'filter toggle updates visible tasks',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Toggle completed'));
      expect(screen.getByText('Fix bug')).toBeTruthy();
      expect(screen.queryByText('Write tests')).toBeFalsy();
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Toggle completed once.'],
    maintainabilityNotes: ['Memo dependencies should cover every reactive value the calculation reads.'],
    solutionNotes: {
      rootCauseMarkdown: 'The memo was cached forever because its dependency list was empty.',
      fixSummaryMarkdown: 'Add the filter state to the dependency array.',
      edgeCasesMarkdown: 'Switching the filter on and off should always recompute the derived list.'
    },
    recallQuestions: ['Why did `useMemo` return stale data?', 'How do you choose memo dependencies?'],
    metadata: { estimatedMinutes: 8 }
  }),
  problem({
    id: 'react-debug-render-storm',
    title: 'Typing Triggers Too Many Expensive Row Renders',
    difficulty: 'medium',
    topics: ['performance', 'memoization', 'event handlers'],
    bugTypes: ['performance regression'],
    briefMarkdown:
      '### Scenario\nA filter input sits above memoized expensive rows.\n\n### Reported issue\nEvery keystroke rerenders all rows even when row props are unchanged.\n\n### Expected\nOnly the filter text should change; rows should stay memoized.\n\n### Observed\nAn unstable callback prop busts memoization.\n\n### Constraints\nKeep the row component memoized.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { ProductList } from './ProductList';

export default function App() {
  const [filter, setFilter] = React.useState('');
  return (
    <div>
      <input aria-label="filter" value={filter} onChange={(event) => setFilter(event.target.value)} />
      <ProductList filter={filter} />
    </div>
  );
}`),
        {
          path: '/src/ProductList.tsx',
          language: 'tsx',
          contents: `import React from 'react';
import { RenderCounterRow } from './RenderCounterRow';

const products = ['Alpha', 'Beta', 'Gamma'];

const Row = React.memo(function Row({
  name,
  onInspect
}: {
  name: string;
  onInspect: (name: string) => void;
}) {
  RenderCounterRow(name);
  return <li onClick={() => onInspect(name)}>{name}</li>;
});

export function ProductList({ filter }: { filter: string }) {
  const visible = products.filter((product) => product.toLowerCase().includes(filter.toLowerCase()));

  return (
    <ul>
      {visible.map((product) => (
        <Row key={product} name={product} onInspect={(name) => console.log(name)} />
      ))}
    </ul>
  );
}`,
          editable: true
        },
        {
          path: '/src/RenderCounterRow.ts',
          language: 'ts',
          contents: `const counts: Record<string, number> = {};

export function RenderCounterRow(name: string) {
  counts[name] = (counts[name] ?? 0) + 1;
}

export function getRenderCount(name: string) {
  return counts[name] ?? 0;
}`,
          editable: false
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';
import { getRenderCount } from './src/RenderCounterRow';

export const tests = [
  {
    name: 'typing non-matching text does not rerender stable rows repeatedly',
    run: () => {
      render(React.createElement(App));
      const before = getRenderCount('Alpha');
      fireEvent.change(screen.getByLabelText('filter'), { target: { value: 'a' } });
      const after = getRenderCount('Alpha');
      expect(after - before).toBe(0);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Typing should not invalidate memoized rows if the props did not change.'],
    maintainabilityNotes: ['Memoized children still rerender when function props get a new identity each render.'],
    solutionNotes: {
      rootCauseMarkdown: 'Each render created a new inline `onInspect` callback, so `React.memo` could not bail out.',
      fixSummaryMarkdown: 'Pass a stable callback into rows, for example by defining it once in the list component.',
      edgeCasesMarkdown: 'Rows that are filtered out can unmount; rows that stay visible should not rerender for unrelated state.'
    },
    recallQuestions: ['Why did `React.memo` fail here?', 'Which prop changed identity on every render?'],
    metadata: { estimatedMinutes: 12 },
    allowedEditablePaths: ['/src/ProductList.tsx']
  }),
  problem({
    id: 'react-debug-event-listener-leak',
    title: 'Resize Handler Fires Multiple Times After Remounts',
    difficulty: 'medium',
    topics: ['effects', 'event handlers'],
    bugTypes: ['event leak'],
    briefMarkdown:
      '### Scenario\nA child component listens for window resize events.\n\n### Reported issue\nToggling the child on and off makes resize updates fire multiple times.\n\n### Expected\nOne mounted listener, removed on unmount.\n\n### Observed\nThe effect leaks listeners.\n\n### Constraints\nKeep the existing resize-based behavior.',
    codebase: {
      files: [
        appFile(`import React from 'react';

function WidthWatcher() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const onResize = () => setCount((value) => value + 1);
    window.addEventListener('resize', onResize);
  }, []);

  return <p data-testid="resize-count">{count}</p>;
}

export default function App() {
  const [visible, setVisible] = React.useState(true);
  return (
    <div>
      <button onClick={() => setVisible((value) => !value)}>Toggle watcher</button>
      {visible ? <WidthWatcher /> : null}
    </div>
  );
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'resize handler does not accumulate across remounts',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Toggle watcher'));
      fireEvent.click(screen.getByText('Toggle watcher'));
      fireEvent(window, new Event('resize'));
      expect(screen.getByTestId('resize-count')).toHaveTextContent('1');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Mount, unmount, and remount the watcher before resizing.'],
    maintainabilityNotes: ['Effects that subscribe should also unsubscribe.'],
    solutionNotes: {
      rootCauseMarkdown: 'The resize listener was attached but never removed in cleanup.',
      fixSummaryMarkdown: 'Return a cleanup function that removes the listener.',
      edgeCasesMarkdown: 'Repeated mounts and unmounts should still leave only one active listener.'
    },
    recallQuestions: ['What cleanup was missing?', 'Why did the duplicate events appear only after remounts?'],
    metadata: { estimatedMinutes: 10 }
  }),
  problem({
    id: 'react-debug-context-value-churn',
    title: 'Theme Consumers Rerender on Unrelated State Changes',
    difficulty: 'medium',
    topics: ['context', 'performance'],
    bugTypes: ['performance regression'],
    briefMarkdown:
      '### Scenario\nA provider exposes a stable theme string and a toggle action.\n\n### Reported issue\nTyping in a sibling input rerenders theme consumers.\n\n### Expected\nConsumers rerender only when context values actually change.\n\n### Observed\nThe provider recreates the context value object on every render.\n\n### Constraints\nKeep context as the transport.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ThemeBadge } from './ThemeBadge';

export default function App() {
  const [text, setText] = React.useState('');
  return (
    <ThemeProvider>
      <input aria-label="draft" value={text} onChange={(event) => setText(event.target.value)} />
      <ThemeBadge />
    </ThemeProvider>
  );
}`),
        {
          path: '/src/ThemeProvider.tsx',
          language: 'tsx',
          contents: `import React from 'react';

export const ThemeContext = React.createContext({
  theme: 'light',
  toggle: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState('light');
  const toggle = () => setTheme((value) => (value === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}`,
          editable: true
        },
        {
          path: '/src/ThemeBadge.tsx',
          language: 'tsx',
          contents: `import React from 'react';
import { ThemeContext } from './ThemeProvider';
import { recordBadgeRender, getBadgeRenderCount } from './renderStats';

export function ThemeBadge() {
  recordBadgeRender();
  const { theme } = React.useContext(ThemeContext);
  return <p data-testid="theme-renders">{theme}:{getBadgeRenderCount()}</p>;
}`,
          editable: false
        },
        {
          path: '/src/renderStats.ts',
          language: 'ts',
          contents: `let badgeRenders = 0;
export const recordBadgeRender = () => {
  badgeRenders += 1;
};
export const getBadgeRenderCount = () => badgeRenders;`,
          editable: false
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
    name: 'typing in sibling input does not rerender the theme badge',
    run: () => {
      render(React.createElement(App));
      expect(screen.getByTestId('theme-renders')).toHaveTextContent('light:1');
      fireEvent.change(screen.getByLabelText('draft'), { target: { value: 'x' } });
      expect(screen.getByTestId('theme-renders')).toHaveTextContent('light:1');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Use the render counter in the badge text.'],
    maintainabilityNotes: ['Context value identity matters for consumer rerenders.'],
    solutionNotes: {
      rootCauseMarkdown: 'The provider created a new object literal for `value` on every render.',
      fixSummaryMarkdown: 'Memoize the provider value so unrelated parent renders do not notify consumers.',
      edgeCasesMarkdown: 'Consumers should still rerender when the theme actually changes.'
    },
    recallQuestions: ['Why do context consumers care about object identity?', 'What should be memoized in a provider?'],
    metadata: { estimatedMinutes: 12 },
    allowedEditablePaths: ['/src/ThemeProvider.tsx']
  }),
  problem({
    id: 'react-debug-infinite-filter-loop',
    title: 'Filtered List Causes an Infinite Render Loop',
    difficulty: 'medium',
    topics: ['effects', 'derived state'],
    bugTypes: ['infinite re-render'],
    briefMarkdown:
      '### Scenario\nA list derives a filtered subset in an effect.\n\n### Reported issue\nThe page locks up almost immediately.\n\n### Expected\nFiltering runs once per relevant input change.\n\n### Observed\nThe effect depends on state that it updates.\n\n### Constraints\nMake a focused dependency fix.',
    codebase: {
      files: [
        appFile(`import React from 'react';

const allItems = ['Ada', 'Grace', 'Linus'];

export default function App() {
  const [query, setQuery] = React.useState('a');
  const [visible, setVisible] = React.useState<string[]>([]);

  React.useEffect(() => {
    setVisible(allItems.filter((item) => item.toLowerCase().includes(query)));
  }, [query, visible]);

  return (
    <div>
      <input aria-label="query" value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul>{visible.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'app renders the filtered names without looping',
    run: () => {
      render(React.createElement(App));
      expect(screen.getByText('Ada')).toBeTruthy();
      expect(screen.getByText('Grace')).toBeTruthy();
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['The issue happens immediately on mount.'],
    maintainabilityNotes: ['Effects should not usually depend on the state they synchronously overwrite.'],
    solutionNotes: {
      rootCauseMarkdown: 'The effect both depended on and updated `visible`, creating a render loop.',
      fixSummaryMarkdown: 'Remove the self-referential dependency and only react to the true input.',
      edgeCasesMarkdown: 'Changing the query should still update the filtered list.'
    },
    recallQuestions: ['Why did the effect loop forever?', 'Which dependency was invalid?'],
    metadata: { estimatedMinutes: 9 }
  }),
  problem({
    id: 'react-debug-optimistic-rollback',
    title: 'Failed Save Leaves the Wrong Todo State',
    difficulty: 'hard',
    topics: ['async', 'state', 'optimistic updates'],
    bugTypes: ['optimistic update rollback'],
    briefMarkdown:
      '### Scenario\nToggling a todo is optimistic and rolls back if the API rejects.\n\n### Reported issue\nA failed save does not restore the previous todo state correctly.\n\n### Expected\nRollback should restore the exact previous snapshot.\n\n### Observed\nThe optimistic update mutates the snapshot it later tries to restore.\n\n### Constraints\nDo not rewrite the entire flow.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { updateTodo } from './todoApi';

export default function App() {
  const [todos, setTodos] = React.useState([{ id: '1', title: 'Write tests', done: false }]);

  const toggleTodo = async (id: string) => {
    const previous = todos;
    const next = todos.map((todo) => {
      if (todo.id === id) {
        todo.done = !todo.done;
      }
      return todo;
    });
    setTodos(next);

    try {
      await updateTodo(id);
    } catch {
      setTodos(previous);
    }
  };

  return (
    <button data-testid="todo" onClick={() => toggleTodo('1')}>
      {todos[0].done ? 'done' : 'pending'}
    </button>
  );
}`),
        {
          path: '/src/todoApi.ts',
          language: 'ts',
          contents: `export async function updateTodo() {
  await new Promise((resolve) => setTimeout(resolve, 5));
  throw new Error('save failed');
}`,
          editable: false
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'failed optimistic save rolls back to pending',
    run: async () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByTestId('todo'));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      expect(screen.getByTestId('todo')).toHaveTextContent('pending');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['The API always rejects in this challenge.'],
    maintainabilityNotes: ['Rollback logic must preserve an immutable snapshot of the previous state.'],
    solutionNotes: {
      rootCauseMarkdown: 'The optimistic update mutated the existing todo objects, so `previous` was no longer a clean snapshot.',
      fixSummaryMarkdown: 'Create a fresh optimistic array without mutating the previous objects.',
      edgeCasesMarkdown: 'Rollback should restore the previous list even after multiple retries.'
    },
    recallQuestions: ['Why did the rollback snapshot fail?', 'What makes optimistic updates safe to undo?'],
    metadata: { estimatedMinutes: 14 }
  }),
  problem({
    id: 'react-debug-tabs-memo-bug',
    title: 'Tab Summary Does Not Update After Selection',
    difficulty: 'easy',
    topics: ['memoization', 'state'],
    bugTypes: ['incorrect memoization'],
    briefMarkdown:
      '### Scenario\nA summary string should reflect the active tab.\n\n### Reported issue\nClicking tabs changes the content but not the summary label.\n\n### Expected\nBoth should update.\n\n### Observed\nThe summary is memoized with stale dependencies.\n\n### Constraints\nMake a minimal fix.',
    codebase: {
      files: [
        appFile(`import React from 'react';

const tabs = ['Overview', 'Settings'];

export default function App() {
  const [active, setActive] = React.useState(0);
  const summary = React.useMemo(() => \`Active: \${tabs[active]}\`, []);

  return (
    <div>
      <p data-testid="summary">{summary}</p>
      {tabs.map((tab, index) => (
        <button key={tab} onClick={() => setActive(index)}>
          {tab}
        </button>
      ))}
      <div>{tabs[active]}</div>
    </div>
  );
}`)]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'summary tracks the active tab',
    run: () => {
      render(React.createElement(App));
      fireEvent.click(screen.getByText('Settings'));
      expect(screen.getByTestId('summary')).toHaveTextContent('Settings');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Compare the summary text with the active content after clicking Settings.'],
    maintainabilityNotes: ['Derived labels should stay coupled to the state they summarize.'],
    solutionNotes: {
      rootCauseMarkdown: 'The memo never recalculated because it had no dependencies.',
      fixSummaryMarkdown: 'Add the active tab index as a dependency.',
      edgeCasesMarkdown: 'The summary should update for every tab selection.'
    },
    recallQuestions: ['What made the summary stale?', 'Was memoization buying anything here?'],
    metadata: { estimatedMinutes: 6 }
  }),
  problem({
    id: 'react-debug-multifile-context-toggle',
    title: 'Context Toggle Works but Consumer Count Spikes',
    difficulty: 'hard',
    topics: ['context', 'performance', 'memoization'],
    bugTypes: ['performance regression'],
    briefMarkdown:
      '### Scenario\nA small settings provider exposes `locale` and `setLocale`.\n\n### Reported issue\nAn unrelated clock rerender still bumps the consumer render count.\n\n### Expected\nConsumers rerender only for locale changes.\n\n### Observed\nThe provider recreates its value object each second.\n\n### Constraints\nDo not remove the clock.',
    codebase: {
      files: [
        appFile(`import React from 'react';
import { SettingsProvider } from './SettingsProvider';
import { LocaleLabel } from './LocaleLabel';

export default function App() {
  return (
    <SettingsProvider>
      <LocaleLabel />
    </SettingsProvider>
  );
}`),
        {
          path: '/src/SettingsProvider.tsx',
          language: 'tsx',
          contents: `import React from 'react';

export const SettingsContext = React.createContext({
  locale: 'en-US',
  setLocale: (_next: string) => {}
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState('en-US');
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <SettingsContext.Provider value={{ locale, setLocale }}>
      <div data-testid="tick">{tick}</div>
      {children}
    </SettingsContext.Provider>
  );
}`,
          editable: true
        },
        {
          path: '/src/LocaleLabel.tsx',
          language: 'tsx',
          contents: `import React from 'react';
import { SettingsContext } from './SettingsProvider';
import { bumpLabelCount, getLabelCount } from './labelStats';

export function LocaleLabel() {
  bumpLabelCount();
  const { locale } = React.useContext(SettingsContext);
  return <p data-testid="label">{locale}:{getLabelCount()}</p>;
}`,
          editable: false
        },
        {
          path: '/src/labelStats.ts',
          language: 'ts',
          contents: `let count = 0;
export const bumpLabelCount = () => {
  count += 1;
};
export const getLabelCount = () => count;`,
          editable: false
        }
      ]
    },
    entryFile: '/src/App.tsx',
    tests: {
      visible: `import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './src/App';

export const tests = [
  {
    name: 'consumer count stays flat across unrelated provider ticks',
    run: async () => {
      render(React.createElement(App));
      expect(screen.getByTestId('label')).toHaveTextContent('en-US:1');
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });
      expect(screen.getByTestId('label')).toHaveTextContent('en-US:1');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    reproductionHints: ['Watch the `:count` suffix after one second passes.'],
    maintainabilityNotes: ['Provider values should be stable across unrelated state changes.'],
    solutionNotes: {
      rootCauseMarkdown: 'The provider regenerated its context value on every clock tick, forcing consumers to rerender.',
      fixSummaryMarkdown: 'Memoize the value based on the actual context fields.',
      edgeCasesMarkdown: 'A real locale change should still propagate immediately.'
    },
    recallQuestions: ['Why did the timer affect consumers?', 'What should the value depend on?'],
    metadata: { estimatedMinutes: 14 },
    allowedEditablePaths: ['/src/SettingsProvider.tsx']
  })
];
