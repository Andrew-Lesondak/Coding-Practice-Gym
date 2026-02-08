import { ReactCodingProblem } from '../types/reactCoding';

export const reactCodingProblems: ReactCodingProblem[] = [
  {
    id: 'react-counter-reducer',
    title: 'Counter with useReducer',
    difficulty: 'easy',
    topics: ['useReducer', 'state'],
    promptMarkdown: `Build a counter component that increments and decrements. Refactor state to use \`useReducer\`.`,
    requirements: ['Render count', 'Increment and decrement buttons', 'Use useReducer'],
    constraints: ['No external state libraries'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define a reducer that handles increment and decrement actions.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Build the Counter component using useReducer.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)

export const Counter: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

type Action = { type: 'inc' } | { type: 'dec' };
const reducer = (state: number, action: Action) => {
  if (action.type === 'inc') return state + 1;
  if (action.type === 'dec') return state - 1;
  return state;
};

export const Counter: React.FC = () => {
  const [count, dispatch] = React.useReducer(reducer, 0);
  return (
    <div>
      <p data-testid="count">{count}</p>
      <button onClick={() => dispatch({ type: 'dec' })}>-</button>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from 'user';

export const tests = [
  {
    name: 'increments and decrements',
    run: () => {
      render(React.createElement(Counter));
      const count = screen.getByTestId('count');
      expect(count.textContent).toBe('0');
      fireEvent.click(screen.getByText('+'));
      expect(count.textContent).toBe('1');
      fireEvent.click(screen.getByText('-'));
      expect(count.textContent).toBe('0');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Not using reducer', 'Mutating state directly'],
      recallQuestions: ['Why useReducer here?', 'How would you extend actions?']
    }
  },
  {
    id: 'react-use-previous',
    title: 'usePrevious Hook',
    difficulty: 'easy',
    topics: ['hooks', 'useRef', 'useEffect'],
    promptMarkdown: `Implement a \`usePrevious\` hook and a demo component that shows current and previous value.`,
    requirements: ['Hook returns previous value', 'Demo component displays both'],
    constraints: ['No external libraries'],
    guidedStubTsx: `import React from 'react';

// Step 1: Implement usePrevious using refs and effect.
// TODO(step 1 start)
// TODO(step 1.1 start)
// TODO(step 1.1 end)
// TODO(step 1.2 start)
// TODO(step 1.2 end)
// TODO(step 1 end)

export const usePrevious = (value: number) => {
  return;
};

// Step 2: Demo component showing current and previous.
// TODO(step 2 start)
// TODO(step 2 end)

export const PreviousDemo: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const usePrevious = (value: number) => {
  const ref = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

export const PreviousDemo: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const prev = usePrevious(count);
  return (
    <div>
      <p data-testid="current">{count}</p>
      <p data-testid="previous">{prev ?? 'none'}</p>
      <button onClick={() => setCount((c) => c + 1)}>Inc</button>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviousDemo } from 'user';

export const tests = [
  {
    name: 'tracks previous value',
    run: () => {
      render(React.createElement(PreviousDemo));
      expect(screen.getByTestId('previous').textContent).toBe('none');
      fireEvent.click(screen.getByText('Inc'));
      expect(screen.getByTestId('current').textContent).toBe('1');
      expect(screen.getByTestId('previous').textContent).toBe('0');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Updating ref before render', 'Missing dependency'],
      recallQuestions: ['Why ref instead of state?', 'When does previous update?']
    }
  },
  {
    id: 'react-tabs',
    title: 'Tabs with Keyboard Navigation',
    difficulty: 'medium',
    topics: ['state', 'accessibility'],
    promptMarkdown: `Build a simple Tabs component with left/right arrow navigation.`,
    requirements: ['Render tabs', 'Arrow keys move active tab', 'Panels show active content'],
    constraints: ['Keep state local'],
    guidedStubTsx: `import React from 'react';

// Step 1: Accept tabs prop and track active index.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Render buttons and handle arrow keys.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)

export const Tabs: React.FC<{ tabs: { label: string; content: string }[] }> = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const Tabs: React.FC<{ tabs: { label: string; content: string }[] }> = ({ tabs }) => {
  const [active, setActive] = React.useState(0);
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') setActive((prev) => (prev + 1) % tabs.length);
    if (event.key === 'ArrowLeft') setActive((prev) => (prev - 1 + tabs.length) % tabs.length);
  };
  return (
    <div>
      <div role="tablist" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button key={tab.label} role="tab" aria-selected={index === active} onClick={() => setActive(index)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tabs[active]?.content}</div>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from 'user';

export const tests = [
  {
    name: 'arrow keys move tabs',
    run: () => {
      render(React.createElement(Tabs, { tabs: [{ label: 'A', content: 'Alpha' }, { label: 'B', content: 'Beta' }] }));
      expect(screen.getByText('Alpha')).toBeTruthy();
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
      expect(screen.getByText('Beta')).toBeTruthy();
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['No keyboard support', 'Off-by-one index'],
      recallQuestions: ['How to wrap around?', 'Which roles are used?']
    }
  },
  {
    id: 'react-theme-context',
    title: 'Theme Toggle with Context',
    difficulty: 'medium',
    topics: ['context', 'useState'],
    promptMarkdown: `Create a ThemeProvider and a toggle button that flips between light/dark.`,
    requirements: ['Context exposes theme + toggle', 'Button toggles text'],
    constraints: ['No external libs'],
    guidedStubTsx: `import React from 'react';

// Step 1: Create ThemeContext with default values.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Implement provider and toggle.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return;
};

export const ThemeToggle: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>('light');
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = React.useContext(ThemeContext);
  return <button onClick={toggle}>{theme}</button>;
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, ThemeToggle } from 'user';

export const tests = [
  {
    name: 'toggles theme text',
    run: () => {
      render(React.createElement(ThemeProvider, null, React.createElement(ThemeToggle)));
      const button = screen.getByRole('button');
      expect(button.textContent).toBe('light');
      fireEvent.click(button);
      expect(button.textContent).toBe('dark');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Forgetting provider', 'No toggle function'],
      recallQuestions: ['Why use context here?', 'How to persist theme?']
    }
  },
  {
    id: 'react-controlled-form',
    title: 'Controlled Form Validation',
    difficulty: 'easy',
    topics: ['forms', 'state'],
    promptMarkdown: `Build a form with email + password. Disable submit unless email includes '@' and password >= 6.`,
    requirements: ['Controlled inputs', 'Validation rules', 'Submit disabled until valid'],
    constraints: ['No form libs'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track input state.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Compute validity.
// TODO(step 2 start)
// TODO(step 2 end)

export const LoginForm: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const isValid = email.includes('@') && password.length >= 6;
  return (
    <form>
      <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input aria-label="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={!isValid}>Submit</button>
    </form>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from 'user';

export const tests = [
  {
    name: 'disables submit until valid',
    run: () => {
      render(React.createElement(LoginForm));
      const button = screen.getByRole('button');
      expect(button.getAttribute('disabled')).toBe('');
      fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.com' } });
      fireEvent.change(screen.getByLabelText('password'), { target: { value: '123456' } });
      expect(button.getAttribute('disabled')).toBe(null);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Uncontrolled inputs', 'Validation not reactive'],
      recallQuestions: ['Why controlled inputs?', 'How to show errors?']
    }
  },
  {
    id: 'react-modal',
    title: 'Accessible Modal',
    difficulty: 'medium',
    topics: ['accessibility', 'state'],
    promptMarkdown: `Create a modal that opens/closes and sets aria attributes.`,
    requirements: ['Modal renders when open', 'Close button', 'aria-modal'],
    constraints: ['No portals required'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track open state.
// TODO(step 1 start)
// TODO(step 1 end)

export const ModalDemo: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const ModalDemo: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div role="dialog" aria-modal="true">
          <p>Modal content</p>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalDemo } from 'user';

export const tests = [
  {
    name: 'opens and closes modal',
    run: () => {
      render(React.createElement(ModalDemo));
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByRole('dialog')).toBeTruthy();
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByRole('dialog')).toBe(null);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Missing aria-modal', 'Not unmounting modal'],
      recallQuestions: ['What makes a modal accessible?', 'How to trap focus?']
    }
  },
  {
    id: 'react-optimistic',
    title: 'Optimistic List Update',
    difficulty: 'medium',
    topics: ['async', 'state'],
    promptMarkdown: `Add items optimistically and roll back on failure.`,
    requirements: ['Add item immediately', 'Rollback on error'],
    constraints: ['Simulate failure with prop'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track items and error state.
// TODO(step 1 start)
// TODO(step 1 end)

export const OptimisticList: React.FC<{ shouldFail?: boolean }> = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const OptimisticList: React.FC<{ shouldFail?: boolean }> = ({ shouldFail }) => {
  const [items, setItems] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const addItem = () => {
    const next = [...items, 'item'];
    setItems(next);
    if (shouldFail) {
      setItems(items);
      setError('Failed');
    }
  };
  return (
    <div>
      <button onClick={addItem}>Add</button>
      {error && <p>{error}</p>}
      <ul>{items.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptimisticList } from 'user';

export const tests = [
  {
    name: 'adds item optimistically',
    run: () => {
      render(React.createElement(OptimisticList));
      fireEvent.click(screen.getByText('Add'));
      expect(screen.getAllByRole('listitem').length).toBe(1);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Not rolling back', 'Mutating state'],
      recallQuestions: ['What is optimistic UI?', 'How to handle errors?']
    }
  },
  {
    id: 'react-memo-list',
    title: 'Memoized List Rendering',
    difficulty: 'medium',
    topics: ['performance', 'useMemo', 'useCallback'],
    promptMarkdown: `Memoize a computed list and stable callbacks to avoid re-renders.`,
    requirements: ['useMemo for derived list', 'useCallback for handler'],
    constraints: ['Simple list'],
    guidedStubTsx: `import React from 'react';

// Step 1: Create memoized list and handler.
// TODO(step 1 start)
// TODO(step 1 end)

export const MemoList: React.FC<{ items: string[] }> = ({ items }) => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const MemoList: React.FC<{ items: string[] }> = ({ items }) => {
  const list = React.useMemo(() => items.map((item) => item.toUpperCase()), [items]);
  const onClick = React.useCallback(() => {}, []);
  return (
    <div>
      <button onClick={onClick}>noop</button>
      <ul>{list.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoList } from 'user';

export const tests = [
  {
    name: 'renders list',
    run: () => {
      render(React.createElement(MemoList, { items: ['a', 'b'] }));
      expect(screen.getAllByRole('listitem').length).toBe(2);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Missing dependencies', 'Recreating callbacks'],
      recallQuestions: ['When to memoize?', 'Downsides?']
    }
  },
  {
    id: 'react-debounced-input',
    title: 'Debounced Input',
    difficulty: 'hard',
    topics: ['useEffect', 'debounce', 'async'],
    promptMarkdown: `Debounce a search input and call onSearch after 300ms of inactivity.`,
    requirements: ['Call onSearch after delay', 'Cleanup timer on change'],
    constraints: ['Use setTimeout'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track input state.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Debounce effect.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)

export const DebouncedSearch: React.FC<{ onSearch: (value: string) => void }> = ({ onSearch }) => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const DebouncedSearch: React.FC<{ onSearch: (value: string) => void }> = ({ onSearch }) => {
  const [value, setValue] = React.useState('');
  React.useEffect(() => {
    const id = window.setTimeout(() => onSearch(value), 300);
    return () => window.clearTimeout(id);
  }, [value, onSearch]);
  return <input aria-label="search" value={value} onChange={(e) => setValue(e.target.value)} />;
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DebouncedSearch } from 'user';

export const tests = [
  {
    name: 'renders input',
    run: () => {
      render(React.createElement(DebouncedSearch, { onSearch: () => {} }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'hi' } });
      expect(screen.getByLabelText('search').getAttribute('value')).toBe('hi');
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Missing cleanup', 'Stale value'],
      recallQuestions: ['Why cleanup matters?', 'How to avoid stale closures?']
    }
  },
  {
    id: 'react-infinite-scroll',
    title: 'Infinite Scroll List',
    difficulty: 'hard',
    topics: ['async', 'effects'],
    promptMarkdown: `Append items when a button is clicked (simulating infinite scroll).`,
    requirements: ['Initial items', 'Load more appends'],
    constraints: ['No observers required'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track items.
// TODO(step 1 start)
// TODO(step 1 end)

export const InfiniteList: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const InfiniteList: React.FC = () => {
  const [items, setItems] = React.useState(['a', 'b']);
  const loadMore = () => setItems((prev) => [...prev, 'c']);
  return (
    <div>
      <button onClick={loadMore}>Load more</button>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfiniteList } from 'user';

export const tests = [
  {
    name: 'appends items',
    run: () => {
      render(React.createElement(InfiniteList));
      const before = screen.getAllByRole('listitem').length;
      fireEvent.click(screen.getByText('Load more'));
      const after = screen.getAllByRole('listitem').length;
      expect(after).toBe(before + 1);
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Replacing list instead of appending'],
      recallQuestions: ['How to avoid duplicates?', 'How to fetch more?']
    }
  },
  {
    id: 'react-async-toggle',
    title: 'Async Toggle',
    difficulty: 'easy',
    topics: ['state', 'async'],
    promptMarkdown: `Show a loading state and flip after a simulated async call.`,
    requirements: ['Loading indicator', 'State toggles after delay'],
    constraints: ['Use setTimeout'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track loading and status.
// TODO(step 1 start)
// TODO(step 1 end)

export const AsyncToggle: React.FC = () => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const AsyncToggle: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [on, setOn] = React.useState(false);
  const toggle = () => {
    setLoading(true);
    setTimeout(() => {
      setOn((prev) => !prev);
      setLoading(false);
    }, 10);
  };
  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      <p>{loading ? 'Loading' : on ? 'On' : 'Off'}</p>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AsyncToggle } from 'user';

export const tests = [
  {
    name: 'renders toggle',
    run: () => {
      render(React.createElement(AsyncToggle));
      expect(screen.getByText('Off')).toBeTruthy();
      fireEvent.click(screen.getByText('Toggle'));
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Not resetting loading', 'Missing cleanup'],
      recallQuestions: ['How to handle errors?', 'How to cancel?']
    }
  },
  {
    id: 'react-async-list',
    title: 'Async List Fetch',
    difficulty: 'medium',
    topics: ['effects', 'async'],
    promptMarkdown: `Fetch list data on mount and render items.`,
    requirements: ['Fetch on mount', 'Render list'],
    constraints: ['Use mock fetch prop'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track items.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Load data on mount.
// TODO(step 2 start)
// TODO(step 2 end)

export const AsyncList: React.FC<{ fetchItems: () => Promise<string[]> }> = ({ fetchItems }) => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const AsyncList: React.FC<{ fetchItems: () => Promise<string[]> }> = ({ fetchItems }) => {
  const [items, setItems] = React.useState<string[]>([]);
  React.useEffect(() => {
    fetchItems().then(setItems);
  }, [fetchItems]);
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { AsyncList } from 'user';

export const tests = [
  {
    name: 'renders list container',
    run: () => {
      render(React.createElement(AsyncList, { fetchItems: async () => ['a'] }));
      expect(screen.getByRole('list')).toBeTruthy();
    }
  }
];`,
      hidden: `export const tests = [];`
    },
    metadata: {
      commonPitfalls: ['Missing dependencies', 'Not handling promises'],
      recallQuestions: ['How to cancel requests?', 'How to handle errors?']
    }
  }
];
