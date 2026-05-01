import { paymentReactCodingProblems } from './reactCodingProblemsPayments';
import { ReactCodingProblem } from '../types/reactCoding';

export const reactCodingProblems: ReactCodingProblem[] = [
  {
    id: 'react-counter-reducer',
    title: 'Counter with useReducer',
    difficulty: 'easy',
    topics: ['useReducer', 'state'],
    promptMarkdown: `Build a counter component that increments and decrements. Refactor state to use \`useReducer\`.`,
    requirements: ['Render count', 'Increment and decrement buttons', 'Use useReducer', 'Keep count output in `data-testid="count"` element'],
    constraints: ['No external state libraries'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define a reducer that handles increment and decrement actions.
// TODO(step 1 start)
// TODO(step 1 end)


export const Counter: React.FC = () => {
// Step 2: Build the Counter component using useReducer.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)
  return (
    <div>
      <p data-testid="count">0</p>
      <button>-</button>
      <button>+</button>
    </div>
  );
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
    name: 'starts at 0 and renders count test id',
    run: () => {
      render(React.createElement(Counter));
      expect(screen.getByTestId('count').textContent).toBe('0');
    }
  },
  {
    name: 'increments and decrements',
    run: () => {
      render(React.createElement(Counter));
      fireEvent.click(screen.getByText('+'));
      expect(screen.getByTestId('count').textContent).toBe('1');
      fireEvent.click(screen.getByText('-'));
      expect(screen.getByTestId('count').textContent).toBe('0');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from 'user';

export const tests = [
  {
    name: 'multiple increments accumulate',
    run: () => {
      render(React.createElement(Counter));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('+'));
      expect(screen.getByTestId('count').textContent).toBe('2');
    }
  },
  {
    name: 'buttons remain interactive after state updates',
    run: () => {
      render(React.createElement(Counter));
      fireEvent.click(screen.getByText('+'));
      fireEvent.click(screen.getByText('-'));
      fireEvent.click(screen.getByText('-'));
      expect(screen.getByTestId('count').textContent).toBe('-1');
    }
  }
];`
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
    requirements: ['Hook returns previous value', 'Demo component displays both', 'Render current/previous outputs with test ids `current` and `previous`'],
    constraints: ['No external libraries'],
    guidedStubTsx: `import React from 'react';


export const usePrevious = (value: number) => {
// Step 1: Implement usePrevious using refs and effect.
// TODO(step 1 start)
// TODO(step 1.1 start)
// TODO(step 1.1 end)
// TODO(step 1.2 start)
// TODO(step 1.2 end)
// TODO(step 1 end)
  return;
};

// Step 2: Demo component showing current and previous.
// TODO(step 2 start)
// TODO(step 2 end)

export const PreviousDemo: React.FC = () => {
  return (
    <div>
      <p data-testid="current">0</p>
      <p data-testid="previous">none</p>
      <button>Inc</button>
    </div>
  );
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
    name: 'initial previous value is none',
    run: () => {
      render(React.createElement(PreviousDemo));
      expect(screen.getByTestId('current').textContent).toBe('0');
      expect(screen.getByTestId('previous').textContent).toBe('none');
    }
  },
  {
    name: 'tracks previous value after increment',
    run: () => {
      render(React.createElement(PreviousDemo));
      fireEvent.click(screen.getByText('Inc'));
      expect(screen.getByTestId('current').textContent).toBe('1');
      expect(screen.getByTestId('previous').textContent).toBe('0');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviousDemo } from 'user';

export const tests = [
  {
    name: 'previous value updates on each increment',
    run: () => {
      render(React.createElement(PreviousDemo));
      fireEvent.click(screen.getByText('Inc'));
      fireEvent.click(screen.getByText('Inc'));
      expect(screen.getByTestId('current').textContent).toBe('2');
      expect(screen.getByTestId('previous').textContent).toBe('1');
    }
  }
];`
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


type TabsProps = { tabs: { label: string; content: string }[] };

export const Tabs = (_props: TabsProps) => {
// Step 2: Render buttons and handle arrow keys.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

type TabsProps = { tabs: { label: string; content: string }[] };

export const Tabs = ({ tabs }: TabsProps) => {
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
    name: 'renders tabs and first panel by default',
    run: () => {
      render(React.createElement(Tabs, { tabs: [{ label: 'A', content: 'Alpha' }, { label: 'B', content: 'Beta' }] }));
      const tabEls = screen.getAllByRole('tab');
      expect(tabEls.length).toBe(2);
      expect(tabEls[0]?.getAttribute('aria-selected')).toBe('true');
      expect(tabEls[1]?.getAttribute('aria-selected')).toBe('false');
      expect(screen.getByRole('tabpanel').textContent).toContain('Alpha');
    }
  },
  {
    name: 'arrow keys move active tab and panel',
    run: () => {
      render(React.createElement(Tabs, { tabs: [{ label: 'A', content: 'Alpha' }, { label: 'B', content: 'Beta' }] }));
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
      const tabEls = screen.getAllByRole('tab');
      expect(tabEls[0]?.getAttribute('aria-selected')).toBe('false');
      expect(tabEls[1]?.getAttribute('aria-selected')).toBe('true');
      expect(screen.getByRole('tabpanel').textContent).toContain('Beta');
    }
  },
  {
    name: 'clicking a tab updates selected state',
    run: () => {
      render(React.createElement(Tabs, { tabs: [{ label: 'A', content: 'Alpha' }, { label: 'B', content: 'Beta' }] }));
      fireEvent.click(screen.getByRole('tab', { name: 'B' }));
      const tabEls = screen.getAllByRole('tab');
      expect(tabEls[1]?.getAttribute('aria-selected')).toBe('true');
      expect(screen.getByRole('tabpanel').textContent).toContain('Beta');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from 'user';

export const tests = [
  {
    name: 'arrow left wraps to last tab',
    run: () => {
      render(React.createElement(Tabs, { tabs: [{ label: 'A', content: 'Alpha' }, { label: 'B', content: 'Beta' }, { label: 'C', content: 'Gamma' }] }));
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' });
      expect(screen.getByRole('tabpanel').textContent).toContain('Gamma');
      const tabEls = screen.getAllByRole('tab');
      expect(tabEls[2]?.getAttribute('aria-selected')).toBe('true');
    }
  },
  {
    name: 'only active tab is selected',
    run: () => {
      render(React.createElement(Tabs, { tabs: [{ label: 'A', content: 'Alpha' }, { label: 'B', content: 'Beta' }] }));
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
      const selected = screen.getAllByRole('tab').filter((el) => el.getAttribute('aria-selected') === 'true');
      expect(selected.length).toBe(1);
    }
  }
];`
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


export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
// Step 2: Implement provider and toggle.
// TODO(step 2 start)
// TODO(step 2.1 start)
// TODO(step 2.1 end)
// TODO(step 2.2 start)
// TODO(step 2.2 end)
// TODO(step 2 end)
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

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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
    name: 'starts on light theme',
    run: () => {
      render(React.createElement(ThemeProvider, null, React.createElement(ThemeToggle)));
      expect(screen.getByRole('button').textContent).toBe('light');
    }
  },
  {
    name: 'toggles between light and dark',
    run: () => {
      render(React.createElement(ThemeProvider, null, React.createElement(ThemeToggle)));
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(button.textContent).toBe('dark');
      fireEvent.click(button);
      expect(button.textContent).toBe('light');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, ThemeToggle } from 'user';

export const tests = [
  {
    name: 'provider value is shared across toggles',
    run: () => {
      render(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement('div', null, React.createElement(ThemeToggle), React.createElement(ThemeToggle))
        )
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]?.textContent).toBe(buttons[1]?.textContent);
    }
  }
];`
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


export const LoginForm: React.FC = () => {
// Step 2: Compute validity.
// TODO(step 2 start)
// TODO(step 2 end)
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
    name: 'submit disabled by default',
    run: () => {
      render(React.createElement(LoginForm));
      const button = screen.getByRole('button');
      expect(button.getAttribute('disabled')).toBe('');
    }
  },
  {
    name: 'enables submit only when email and password are valid',
    run: () => {
      render(React.createElement(LoginForm));
      const button = screen.getByRole('button');
      fireEvent.change(screen.getByLabelText('email'), { target: { value: 'a@b.com' } });
      expect(button.getAttribute('disabled')).toBe('');
      fireEvent.change(screen.getByLabelText('password'), { target: { value: '123456' } });
      expect(button.getAttribute('disabled')).toBe(null);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from 'user';

export const tests = [
  {
    name: 'invalid email keeps submit disabled',
    run: () => {
      render(React.createElement(LoginForm));
      const button = screen.getByRole('button');
      fireEvent.change(screen.getByLabelText('email'), { target: { value: 'ab.com' } });
      fireEvent.change(screen.getByLabelText('password'), { target: { value: '123456' } });
      expect(button.getAttribute('disabled')).toBe('');
    }
  }
];`
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


export const ModalDemo: React.FC = () => {
// Step 1: Track open state.
// TODO(step 1 start)
// TODO(step 1 end)
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
    name: 'modal is hidden initially',
    run: () => {
      render(React.createElement(ModalDemo));
      expect(screen.queryByRole('dialog')).toBe(null);
    }
  },
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
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalDemo } from 'user';

export const tests = [
  {
    name: 'dialog has aria-modal true when open',
    run: () => {
      render(React.createElement(ModalDemo));
      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true');
    }
  }
];`
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


export const OptimisticList = (_props: { shouldFail?: boolean }) => {
// Step 1: Track items and error state.
// TODO(step 1 start)
// TODO(step 1 end)
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const OptimisticList = ({ shouldFail }: { shouldFail?: boolean }) => {
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
  },
  {
    name: 'can add more than once',
    run: () => {
      render(React.createElement(OptimisticList));
      fireEvent.click(screen.getByText('Add'));
      fireEvent.click(screen.getByText('Add'));
      expect(screen.getAllByRole('listitem').length).toBe(2);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptimisticList } from 'user';

export const tests = [
  {
    name: 'rollback path surfaces error and removes optimistic item',
    run: () => {
      render(React.createElement(OptimisticList, { shouldFail: true }));
      fireEvent.click(screen.getByText('Add'));
      expect(screen.queryAllByRole('listitem').length).toBe(0);
      expect(screen.getByText('Failed')).toBeTruthy();
    }
  }
];`
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


export const MemoList = ({ items }: { items: string[] }) => {
// Step 1: Create memoized list and handler.
// TODO(step 1 start)
// TODO(step 1 end)
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const MemoList = ({ items }: { items: string[] }) => {
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
    name: 'renders uppercase items',
    run: () => {
      render(React.createElement(MemoList, { items: ['a', 'b'] }));
      const items = screen.getAllByRole('listitem').map((el) => el.textContent);
      expect(items).toEqual(['A', 'B']);
    }
  },
  {
    name: 'renders handler button',
    run: () => {
      render(React.createElement(MemoList, { items: ['a'] }));
      expect(screen.getByRole('button', { name: 'noop' })).toBeTruthy();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoList } from 'user';

export const tests = [
  {
    name: 'list updates when items prop changes',
    run: () => {
      const view = render(React.createElement(MemoList, { items: ['a'] }));
      expect(screen.getAllByRole('listitem').map((el) => el.textContent)).toEqual(['A']);
      view.rerender(React.createElement(MemoList, { items: ['a', 'c'] }));
      expect(screen.getAllByRole('listitem').map((el) => el.textContent)).toEqual(['A', 'C']);
    }
  }
];`
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

export const DebouncedSearch = ({ onSearch }: { onSearch: (value: string) => void }) => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const DebouncedSearch = ({ onSearch }: { onSearch: (value: string) => void }) => {
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
    name: 'input is controlled',
    run: () => {
      render(React.createElement(DebouncedSearch, { onSearch: () => {} }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'hi' } });
      expect(screen.getByLabelText('search').getAttribute('value')).toBe('hi');
    }
  },
  {
    name: 'calls onSearch after debounce',
    run: async () => {
      const calls: string[] = [];
      render(React.createElement(DebouncedSearch, { onSearch: (value: string) => calls.push(value) }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'hello' } });
      await new Promise((resolve) => setTimeout(resolve, 350));
      expect(calls[calls.length - 1]).toBe('hello');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DebouncedSearch } from 'user';

export const tests = [
  {
    name: 'rapid typing emits latest value',
    run: async () => {
      const calls: string[] = [];
      render(React.createElement(DebouncedSearch, { onSearch: (value: string) => calls.push(value) }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'a' } });
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'ab' } });
      await new Promise((resolve) => setTimeout(resolve, 350));
      expect(calls[calls.length - 1]).toBe('ab');
    }
  }
];`
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


export const InfiniteList: React.FC = () => {
// Step 1: Track items.
// TODO(step 1 start)
// TODO(step 1 end)
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
    name: 'renders initial items',
    run: () => {
      render(React.createElement(InfiniteList));
      expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
    }
  },
  {
    name: 'load more appends items',
    run: () => {
      render(React.createElement(InfiniteList));
      const before = screen.getAllByRole('listitem').length;
      fireEvent.click(screen.getByText('Load more'));
      const after = screen.getAllByRole('listitem').length;
      expect(after).toBe(before + 1);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfiniteList } from 'user';

export const tests = [
  {
    name: 'multiple load more clicks keep appending',
    run: () => {
      render(React.createElement(InfiniteList));
      const before = screen.getAllByRole('listitem').length;
      fireEvent.click(screen.getByText('Load more'));
      fireEvent.click(screen.getByText('Load more'));
      expect(screen.getAllByRole('listitem').length).toBe(before + 2);
    }
  }
];`
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


export const AsyncToggle: React.FC = () => {
// Step 1: Track loading and status.
// TODO(step 1 start)
// TODO(step 1 end)
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
    name: 'starts off',
    run: () => {
      render(React.createElement(AsyncToggle));
      expect(screen.getByText('Off')).toBeTruthy();
    }
  },
  {
    name: 'shows loading then toggles on',
    run: async () => {
      render(React.createElement(AsyncToggle));
      fireEvent.click(screen.getByText('Toggle'));
      expect(screen.getByText('Loading')).toBeTruthy();
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(screen.getByText('On')).toBeTruthy();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AsyncToggle } from 'user';

export const tests = [
  {
    name: 'second toggle flips back off',
    run: async () => {
      render(React.createElement(AsyncToggle));
      fireEvent.click(screen.getByText('Toggle'));
      await new Promise((resolve) => setTimeout(resolve, 20));
      fireEvent.click(screen.getByText('Toggle'));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(screen.getByText('Off')).toBeTruthy();
    }
  }
];`
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

export const AsyncList = ({ fetchItems }: { fetchItems: () => Promise<string[]> }) => {
  return;
};`,
    referenceSolutionTsx: `import React from 'react';

export const AsyncList = ({ fetchItems }: { fetchItems: () => Promise<string[]> }) => {
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
  },
  {
    name: 'fetches and renders items',
    run: async () => {
      render(React.createElement(AsyncList, { fetchItems: async () => ['a', 'b'] }));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(screen.getAllByRole('listitem').length).toBe(2);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { AsyncList } from 'user';

export const tests = [
  {
    name: 'calls fetch exactly once on mount with stable prop',
    run: async () => {
      let calls = 0;
      const fetchItems = async () => {
        calls += 1;
        return ['x'];
      };
      render(React.createElement(AsyncList, { fetchItems }));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(calls).toBe(1);
      expect(screen.getAllByRole('listitem').length).toBe(1);
    }
  }
];`
    },
    metadata: {
      commonPitfalls: ['Missing dependencies', 'Not handling promises'],
      recallQuestions: ['How to cancel requests?', 'How to handle errors?']
    }
  },
  ...paymentReactCodingProblems
];
