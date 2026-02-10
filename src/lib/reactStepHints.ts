type StepHints = Record<number, { level1: string; level2: string; level3: string }>;

const hintsByProblem: Record<string, StepHints> = {
  'react-counter-reducer': {
    1: {
      level1: 'Reducer for increment/decrement actions.',
      level2: 'Define Action type and reducer that handles "inc" and "dec".',
      level3: 'Example: if (action.type === "inc") return state + 1.'
    },
    2: {
      level1: 'Counter component with useReducer.',
      level2: 'Initialize useReducer and render UI that dispatches actions.',
      level3: 'Example: const [count, dispatch] = useReducer(reducer, 0).'
    },
    2.1: {
      level1: 'Initialize reducer state.',
      level2: 'Call useReducer with reducer + initial value.',
      level3: 'Example: const [count, dispatch] = React.useReducer(reducer, 0).'
    },
    2.2: {
      level1: 'Render count + buttons.',
      level2: 'Show count and wire +/- buttons to dispatch.',
      level3: 'Example: <p data-testid="count">{count}</p>.'
    }
  },
  'react-use-previous': {
    1: {
      level1: 'Implement usePrevious.',
      level2: 'Use a ref to store the previous value and update it in an effect.',
      level3: 'Example: const ref = useRef(); useEffect(() => { ref.current = value; }, [value]);'
    },
    1.1: {
      level1: 'Create a ref.',
      level2: 'Initialize a ref that will store the previous value.',
      level3: 'Example: const ref = React.useRef<number | undefined>(undefined).'
    },
    1.2: {
      level1: 'Update ref in effect.',
      level2: 'Update ref.current after each render and return it.',
      level3: 'Example: useEffect(() => { ref.current = value; }, [value]); return ref.current;'
    },
    2: {
      level1: 'Demo component using usePrevious.',
      level2: 'Track count with state and render current/previous values.',
      level3: 'Example: const prev = usePrevious(count); render both in <p> tags.'
    }
  },
  'react-tabs': {
    1: {
      level1: 'Track active tab index.',
      level2: 'Accept tabs prop and store active index in state.',
      level3: 'Example: const [active, setActive] = useState(0).'
    },
    2: {
      level1: 'Render tab buttons and keyboard navigation.',
      level2: 'Handle ArrowLeft/ArrowRight and render active panel.',
      level3: 'Example: onKeyDown updates index with wrap-around.'
    },
    2.1: {
      level1: 'Keyboard handler.',
      level2: 'Move active index with ArrowLeft/ArrowRight.',
      level3: 'Example: if (key==="ArrowRight") setActive((i)=> (i+1)%tabs.length).'
    },
    2.2: {
      level1: 'Render tabs and panel.',
      level2: 'Map tabs to buttons and render active content.',
      level3: 'Example: <div role="tabpanel">{tabs[active].content}</div>.'
    }
  },
  'react-theme-context': {
    1: {
      level1: 'Create ThemeContext.',
      level2: 'Use createContext with theme + toggle defaults.',
      level3: 'Example: createContext({ theme: "light", toggle: () => {} }).'
    },
    2: {
      level1: 'Provider + toggle components.',
      level2: 'Provider manages state; toggle reads context and flips.',
      level3: 'Example: <ThemeContext.Provider value={{theme, toggle}}>...'
    },
    2.1: {
      level1: 'Provider state + toggle.',
      level2: 'useState for theme and a toggle function.',
      level3: 'Example: setTheme((t)=> t==="light" ? "dark" : "light").'
    },
    2.2: {
      level1: 'Toggle button.',
      level2: 'Read theme/toggle from context and render a button.',
      level3: 'Example: const {theme, toggle}=useContext(ThemeContext).'
    }
  },
  'react-controlled-form': {
    1: {
      level1: 'Track email and password.',
      level2: 'Use useState for both inputs and wire onChange.',
      level3: 'Example: const [email, setEmail] = useState("").'
    },
    2: {
      level1: 'Compute validity.',
      level2: 'Validate email includes "@" and password length >= 6.',
      level3: 'Example: const isValid = email.includes("@") && password.length >= 6.'
    }
  },
  'react-modal': {
    1: {
      level1: 'Track open state.',
      level2: 'useState(false) and conditionally render modal.',
      level3: 'Example: {open && <div role="dialog" aria-modal="true">...'
    }
  },
  'react-optimistic': {
    1: {
      level1: 'Track items and error.',
      level2: 'useState for list and error, add item optimistically.',
      level3: 'Example: setItems([...items, "item"]); if shouldFail rollback.'
    }
  },
  'react-memo-list': {
    1: {
      level1: 'Memoize list and handler.',
      level2: 'Use useMemo for derived list and useCallback for handler.',
      level3: 'Example: const list = useMemo(() => items.map(...), [items]).'
    }
  },
  'react-debounced-input': {
    1: {
      level1: 'Track input value.',
      level2: 'useState for value and wire input onChange.',
      level3: 'Example: <input value={value} onChange={(e)=>setValue(e.target.value)} />.'
    },
    2: {
      level1: 'Debounced effect.',
      level2: 'Start timeout on value change and clear on cleanup.',
      level3: 'Example: const id = setTimeout(...); return () => clearTimeout(id).'
    },
    2.1: {
      level1: 'Set timeout.',
      level2: 'Call onSearch after 300ms of inactivity.',
      level3: 'Example: const id = window.setTimeout(() => onSearch(value), 300).'
    },
    2.2: {
      level1: 'Cleanup timeout.',
      level2: 'Clear the timeout in the cleanup function.',
      level3: 'Example: return () => window.clearTimeout(id).'
    }
  },
  'react-infinite-scroll': {
    1: {
      level1: 'Track items.',
      level2: 'useState with initial items and append in handler.',
      level3: 'Example: setItems((prev)=> [...prev, "c"]).'
    }
  },
  'react-async-toggle': {
    1: {
      level1: 'Track loading + status.',
      level2: 'useState for loading and on/off, toggle after timeout.',
      level3: 'Example: setLoading(true); setTimeout(() => { setOn(!on); setLoading(false); }, 10).'
    }
  },
  'react-async-list': {
    1: {
      level1: 'Track items.',
      level2: 'useState([]) and render list from items.',
      level3: 'Example: <ul>{items.map((item)=> <li key={item}>{item}</li>)}</ul>.'
    },
    2: {
      level1: 'Load on mount.',
      level2: 'useEffect to call fetchItems and setItems.',
      level3: 'Example: useEffect(() => { fetchItems().then(setItems); }, [fetchItems]).'
    }
  }
};

export const getReactStepHints = (problemId: string, steps: { index: number; title: string }[]) => {
  const hints = hintsByProblem[problemId] ?? {};
  return steps.reduce<Record<number, { level1: string; level2: string; level3: string }>>((acc, step) => {
    const entry = hints[step.index];
    if (entry) {
      acc[step.index] = entry;
    } else {
      acc[step.index] = {
        level1: step.title,
        level2: step.title,
        level3: step.title
      };
    }
    return acc;
  }, {});
};
