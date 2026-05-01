import { ReactCodingProblem } from '../types/reactCoding';

export const paymentReactCodingProblems: ReactCodingProblem[] = [
  {
    id: 'payment-sdk-embedded-button',
    title: 'Embedded Payment Button SDK',
    difficulty: 'medium',
    topics: ['javascript-sdk', 'sdk api design', 'dom', 'idempotency', 'async'],
    promptMarkdown: 'Build a browser SDK that exposes `window.PaymentSDK.init(config)` and renders a payment button into a merchant container.',
    requirements: [
      'Expose window.PaymentSDK.init(config)',
      'Validate required config fields defensively',
      'Render a button into containerId',
      'Prevent duplicate renders per container',
      'Simulate async checkout and show loading/success/error states',
      'Call onSuccess/onError callbacks appropriately'
    ],
    constraints: ['No external network calls', 'No external libraries', 'Keep container instances independent'],
    guidedStubTsx: `type PaymentConfig = {
  merchantId: string;
  containerId: string;
  amount: number;
  onSuccess?: (payload: { amount: number; merchantId: string }) => void;
  onError?: (error: Error) => void;
};

type PaymentInstance = { cleanup: () => void };

export const PaymentSDK = {
  init: (_config: PaymentConfig): PaymentInstance => {
    // Step 1: Validate incoming config.
    // TODO(step 1 start)
    // TODO(step 1 end)

    // Step 2: Resolve target container and guard missing container.
    // TODO(step 2 start)
    // TODO(step 2 end)

    // Step 3: Prevent duplicate render per container.
    // TODO(step 3 start)
    // TODO(step 3 end)

    // Step 4: Render button and status node.
    // TODO(step 4 start)
    // TODO(step 4 end)

    // Step 5: Handle click transitions and in-flight guard.
    // TODO(step 5 start)
    // TODO(step 5 end)

    // Step 6: Simulate async checkout and resolve success or error.
    // TODO(step 6 start)
    // TODO(step 6 end)

    // Step 7: Call success/error callbacks safely.
    // TODO(step 7 start)
    // TODO(step 7 end)

    // Step 8: Expose cleanup for container instance.
    // TODO(step 8 start)
    // TODO(step 8 end)
    return { cleanup: () => {} };
  }
};

(window as any).PaymentSDK = PaymentSDK;`,
    referenceSolutionTsx: `type PaymentConfig = {
  merchantId: string;
  containerId: string;
  amount: number;
  onSuccess?: (payload: { amount: number; merchantId: string }) => void;
  onError?: (error: Error) => void;
};

type PaymentInstance = { cleanup: () => void };

type Internal = {
  button: HTMLButtonElement;
  status: HTMLDivElement;
  inFlight: boolean;
};

const instances = new Map<string, Internal>();

const validate = (config: PaymentConfig) => {
  if (!config || !config.merchantId || !config.containerId || typeof config.amount !== 'number') {
    throw new Error('Invalid config');
  }
};

const emitError = (config: PaymentConfig, err: Error) => {
  config.onError?.(err);
};

export const PaymentSDK = {
  init: (config: PaymentConfig): PaymentInstance => {
    try {
      validate(config);
      const container = document.getElementById(config.containerId);
      if (!container) {
        const err = new Error('Container not found');
        emitError(config, err);
        return { cleanup: () => {} };
      }

      const existing = instances.get(config.containerId);
      if (existing) {
        return {
          cleanup: () => {
            existing.button.remove();
            existing.status.remove();
            instances.delete(config.containerId);
          }
        };
      }

      const button = document.createElement('button');
      button.textContent = 'Pay now';
      const status = document.createElement('div');
      status.textContent = 'idle';
      container.appendChild(button);
      container.appendChild(status);

      const state: Internal = { button, status, inFlight: false };
      instances.set(config.containerId, state);

      button.onclick = () => {
        if (state.inFlight) return;
        state.inFlight = true;
        button.disabled = true;
        status.textContent = 'loading';
        window.setTimeout(() => {
          if (config.amount > 0) {
            status.textContent = 'success';
            config.onSuccess?.({ amount: config.amount, merchantId: config.merchantId });
          } else {
            const err = new Error('Checkout failed');
            status.textContent = 'error';
            emitError(config, err);
          }
          state.inFlight = false;
          button.disabled = false;
        }, 20);
      };

      return {
        cleanup: () => {
          button.remove();
          status.remove();
          instances.delete(config.containerId);
        }
      };
    } catch (error) {
      emitError(config, error as Error);
      return { cleanup: () => {} };
    }
  }
};

(window as any).PaymentSDK = PaymentSDK;`,
    tests: {
      visible: `import { PaymentSDK } from 'user';

export const tests = [
  {
    name: 'renders button into container',
    run: () => {
      document.body.innerHTML = '<div id="a"></div>';
      PaymentSDK.init({ merchantId: 'm1', containerId: 'a', amount: 100 });
      expect(document.querySelectorAll('#a button').length).toBe(1);
    }
  },
  {
    name: 'init twice does not duplicate button',
    run: () => {
      document.body.innerHTML = '<div id="a"></div>';
      PaymentSDK.init({ merchantId: 'm1', containerId: 'a', amount: 100 });
      PaymentSDK.init({ merchantId: 'm1', containerId: 'a', amount: 100 });
      expect(document.querySelectorAll('#a button').length).toBe(1);
    }
  },
  {
    name: 'clicking shows loading then success',
    run: async () => {
      document.body.innerHTML = '<div id="a"></div>';
      PaymentSDK.init({ merchantId: 'm1', containerId: 'a', amount: 100 });
      const button = document.querySelector('#a button') as HTMLButtonElement;
      const status = document.querySelector('#a div') as HTMLDivElement;
      button.click();
      expect(status.textContent).toBe('loading');
      await new Promise((r) => setTimeout(r, 25));
      expect(status.textContent).toBe('success');
    }
  }
];`,
      hidden: `import { PaymentSDK } from 'user';

export const tests = [
  {
    name: 'invalid container calls onError',
    run: () => {
      document.body.innerHTML = '';
      let called = 0;
      PaymentSDK.init({ merchantId: 'm1', containerId: 'missing', amount: 10, onError: () => { called += 1; } });
      expect(called).toBe(1);
    }
  },
  {
    name: 'multiple containers remain independent and duplicate clicks are guarded',
    run: async () => {
      document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
      let success = 0;
      PaymentSDK.init({ merchantId: 'm1', containerId: 'a', amount: 10, onSuccess: () => { success += 1; } });
      PaymentSDK.init({ merchantId: 'm1', containerId: 'b', amount: 10 });
      const buttonA = document.querySelector('#a button') as HTMLButtonElement;
      const buttonB = document.querySelector('#b button') as HTMLButtonElement;
      expect(buttonA).toBeTruthy();
      expect(buttonB).toBeTruthy();
      buttonA.click();
      buttonA.click();
      await new Promise((r) => setTimeout(r, 25));
      expect(success).toBe(1);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '30-40 min',
      commonPitfalls: ['Missing config validation', 'Duplicate render leaks', 'Allowing concurrent duplicate checkouts'],
      recallQuestions: ['Why cache instances per container?', 'Where should in-flight guards live?', 'How do you design safe SDK callbacks?']
    }
  },
  {
    id: 'react-checkout-widget-affirm',
    title: 'React Checkout Widget',
    difficulty: 'medium',
    topics: ['react-component', 'state machine', 'async lifecycle', 'duplicate prevention'],
    promptMarkdown: 'Build a checkout widget with idle/loading/success/error states and callback ordering guarantees.',
    requirements: ['Render amount and merchant name', 'Use single status state', 'Disable duplicate clicks', 'Call callbacks in order', 'Keep merchant/amount/status outputs with test ids `merchant`, `amount`, `status`'],
    constraints: ['No external libs', 'No network'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define a status union and status state.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Render idle message and pay button.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Implement checkout click handler.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Prevent duplicate clicks while loading.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Transition to loading.
// TODO(step 5 start)
// TODO(step 5 end)

// Step 6: Simulate async result.
// TODO(step 6 start)
// TODO(step 6 end)

// Step 7: Render success and error UI.
// TODO(step 7 start)
// TODO(step 7 end)

// Step 8: Call callbacks in the right order.
// TODO(step 8 start)
// TODO(step 8 end)

type Props = {
  amount: number;
  merchantName: string;
  onCheckoutStart?: () => void;
  onCheckoutComplete?: (status: 'success' | 'error') => void;
};

export const CheckoutWidget: React.FC<Props> = () => {
  return (
    <section>
      <p data-testid="merchant"></p>
      <p data-testid="amount"></p>
      <button>Pay with Affirm</button>
      <p data-testid="status">idle</p>
    </section>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type Props = {
  amount: number;
  merchantName: string;
  onCheckoutStart?: () => void;
  onCheckoutComplete?: (status: 'success' | 'error') => void;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export const CheckoutWidget: React.FC<Props> = ({ amount, merchantName, onCheckoutStart, onCheckoutComplete }) => {
  const [status, setStatus] = React.useState<Status>('idle');

  const onPay = () => {
    if (status === 'loading') return;
    onCheckoutStart?.();
    setStatus('loading');
    window.setTimeout(() => {
      if (amount > 0) {
        setStatus('success');
        onCheckoutComplete?.('success');
      } else {
        setStatus('error');
        onCheckoutComplete?.('error');
      }
    }, 20);
  };

  return (
    <section>
      <p data-testid="merchant">{merchantName}</p>
      <p data-testid="amount">{amount}</p>
      <button onClick={onPay} disabled={status === 'loading'}>Pay with Affirm</button>
      <p data-testid="status">{status}</p>
    </section>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutWidget } from 'user';

export const tests = [
  {
    name: 'renders amount and merchant name',
    run: () => {
      render(React.createElement(CheckoutWidget, { amount: 120, merchantName: 'Shop' }));
      expect(screen.getByTestId('merchant').textContent).toBe('Shop');
      expect(screen.getByTestId('amount').textContent).toBe('120');
    }
  },
  {
    name: 'click starts checkout and disables button',
    run: () => {
      render(React.createElement(CheckoutWidget, { amount: 120, merchantName: 'Shop' }));
      const button = screen.getByText('Pay with Affirm') as HTMLButtonElement;
      fireEvent.click(button);
      expect(button.disabled).toBe(true);
      expect(screen.getByTestId('status').textContent).toBe('loading');
    }
  },
  {
    name: 'success shows success and calls callbacks',
    run: async () => {
      const calls: string[] = [];
      render(React.createElement(CheckoutWidget, {
        amount: 120,
        merchantName: 'Shop',
        onCheckoutStart: () => calls.push('start'),
        onCheckoutComplete: () => calls.push('complete')
      }));
      fireEvent.click(screen.getByText('Pay with Affirm'));
      await new Promise((r) => setTimeout(r, 25));
      expect(screen.getByTestId('status').textContent).toBe('success');
      expect(calls.join(',')).toBe('start,complete');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutWidget } from 'user';

export const tests = [
  {
    name: 'duplicate clicks only start once while loading',
    run: async () => {
      let starts = 0;
      render(React.createElement(CheckoutWidget, { amount: 1, merchantName: 'x', onCheckoutStart: () => { starts += 1; } }));
      const button = screen.getByText('Pay with Affirm');
      fireEvent.click(button);
      fireEvent.click(button);
      await new Promise((r) => setTimeout(r, 25));
      expect(starts).toBe(1);
    }
  },
  {
    name: 'error path shows error and callback order',
    run: async () => {
      const calls: string[] = [];
      render(React.createElement(CheckoutWidget, {
        amount: 0,
        merchantName: 'Shop',
        onCheckoutStart: () => calls.push('start'),
        onCheckoutComplete: (s) => calls.push(s)
      }));
      fireEvent.click(screen.getByText('Pay with Affirm'));
      await new Promise((r) => setTimeout(r, 25));
      expect(screen.getByTestId('status').textContent).toBe('error');
      expect(calls.join(',')).toBe('start,error');
    }
  }
];`
    },
    metadata: {
      timeComplexity: '25-35 min',
      commonPitfalls: ['Scattered booleans for state', 'Missing duplicate-click guard', 'Callback order race bugs'],
      recallQuestions: ['Why is a status union cleaner?', 'Where do you guard duplicate actions?', 'How do you test callback ordering?']
    }
  },
  {
    id: 'react-prevent-stale-search-results',
    title: 'Prevent Stale Search Results',
    difficulty: 'medium',
    topics: ['react-component', 'race conditions', 'debounce', 'effect cleanup'],
    promptMarkdown: 'Build a search component that avoids stale async results overwriting newer queries.',
    requirements: ['Track query/results/status/error', 'Debounce typing', 'Guard stale responses', 'Handle empty query'],
    constraints: ['Inject search API as prop', 'No network'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track query, results, status, and error.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Debounce query updates.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Fetch results when debounced query changes.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Guard stale responses.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Render loading, error, empty, and success states.
// TODO(step 5 start)
// TODO(step 5 end)


type Props = { searchApi: (query: string) => Promise<string[]>; debounceMs?: number };

export const SearchCheckout: React.FC<Props> = () => {
// Step 6: Cleanup pending work.
// TODO(step 6 start)
// TODO(step 6 end)
  return (
    <section>
      <input aria-label="search" />
      <p data-testid="status">idle</p>
      <p data-testid="error"></p>
      <p data-testid="empty">empty</p>
    </section>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type Props = { searchApi: (query: string) => Promise<string[]>; debounceMs?: number };
type Status = 'idle' | 'loading' | 'success' | 'error';

export const SearchCheckout: React.FC<Props> = ({ searchApi, debounceMs = 10 }) => {
  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [results, setResults] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<Status>('idle');
  const [error, setError] = React.useState('');
  const reqId = React.useRef(0);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), debounceMs);
    return () => window.clearTimeout(t);
  }, [query, debounceMs]);

  React.useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setError('');
      setStatus('idle');
      return;
    }
    const id = ++reqId.current;
    setStatus('loading');
    setError('');
    searchApi(debounced)
      .then((items) => {
        if (id !== reqId.current) return;
        setResults(items);
        setStatus('success');
      })
      .catch((e) => {
        if (id !== reqId.current) return;
        setError((e as Error).message || 'error');
        setStatus('error');
      });
  }, [debounced, searchApi]);

  return (
    <section>
      <input aria-label="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p data-testid="status">{status}</p>
      {status === 'error' && <p data-testid="error">{error}</p>}
      {status === 'idle' && <p data-testid="empty">empty</p>}
      <ul>{results.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchCheckout } from 'user';

export const tests = [
  {
    name: 'typing fetches and renders results',
    run: async () => {
      render(React.createElement(SearchCheckout, { searchApi: async (q) => [q + '-1'] }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'pay' } });
      await new Promise((r) => setTimeout(r, 25));
      expect(screen.getByText('pay-1')).toBeTruthy();
    }
  },
  {
    name: 'loading state appears while fetching',
    run: async () => {
      render(React.createElement(SearchCheckout, { searchApi: async () => { await new Promise((r) => setTimeout(r, 30)); return ['x']; } }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'a' } });
      await new Promise((r) => setTimeout(r, 15));
      expect(screen.getByTestId('status').textContent).toBe('loading');
    }
  },
  {
    name: 'empty query clears results',
    run: async () => {
      render(React.createElement(SearchCheckout, { searchApi: async (q) => [q] }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'abc' } });
      await new Promise((r) => setTimeout(r, 25));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: '' } });
      await new Promise((r) => setTimeout(r, 20));
      expect(screen.getByTestId('empty').textContent).toBe('empty');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchCheckout } from 'user';

export const tests = [
  {
    name: 'slow old request cannot overwrite newer result',
    run: async () => {
      render(React.createElement(SearchCheckout, {
        searchApi: (q) => new Promise((resolve) => {
          const ms = q === 'old' ? 40 : 10;
          setTimeout(() => resolve([q]), ms);
        })
      }));
      const input = screen.getByLabelText('search');
      fireEvent.change(input, { target: { value: 'old' } });
      await new Promise((r) => setTimeout(r, 12));
      fireEvent.change(input, { target: { value: 'new' } });
      await new Promise((r) => setTimeout(r, 55));
      expect(screen.getByText('new')).toBeTruthy();
    }
  },
  {
    name: 'error renders and then recovers',
    run: async () => {
      let fail = true;
      render(React.createElement(SearchCheckout, {
        searchApi: async (q) => {
          if (fail) throw new Error('boom');
          return [q];
        }
      }));
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'a' } });
      await new Promise((r) => setTimeout(r, 20));
      expect(screen.getByTestId('error').textContent).toContain('boom');
      fail = false;
      fireEvent.change(screen.getByLabelText('search'), { target: { value: 'b' } });
      await new Promise((r) => setTimeout(r, 20));
      expect(screen.getByText('b')).toBeTruthy();
    }
  }
];`
    },
    metadata: {
      timeComplexity: '30-45 min',
      commonPitfalls: ['Not handling stale responses', 'No cleanup for debounce timer', 'Not resetting empty query state'],
      recallQuestions: ['How does request-id guarding work?', 'Why debounce input?', 'How do you recover from error state?']
    }
  },
  {
    id: 'react-use-async-hook',
    title: 'useAsync Hook',
    difficulty: 'medium',
    topics: ['react-hook', 'async state machine', 'retry', 'stale response handling'],
    promptMarkdown: 'Create a reusable useAsync hook that handles idle/loading/success/error and stale responses.',
    requirements: ['Return data/error/status/execute/reset', 'Ignore stale responses', 'Support retry', 'Avoid updates after unmount'],
    constraints: ['No external libs'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define state shape.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Build execute function.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Transition to loading.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Save success and error.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Guard stale responses.
// TODO(step 5 start)
// TODO(step 5 end)

// Step 6: Implement reset.
// TODO(step 6 start)
// TODO(step 6 end)

// Step 7: Cleanup unmount updates.
// TODO(step 7 start)
// TODO(step 7 end)

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useAsync = <T,>(fn: () => Promise<T>) => {
  return;
};

export const UseAsyncDemo = (_props: { fn: () => Promise<string> }) => {
  return (
    <div>
      <button>Run</button>
      <button>Reset</button>
      <p data-testid="status">idle</p>
      <p data-testid="data"></p>
      <p data-testid="error"></p>
    </div>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useAsync = <T,>(fn: () => Promise<T>) => {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [status, setStatus] = React.useState<Status>('idle');
  const requestId = React.useRef(0);
  const mounted = React.useRef(true);

  React.useEffect(() => () => { mounted.current = false; }, []);

  const execute = React.useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);
    try {
      const result = await fn();
      if (!mounted.current || id !== requestId.current) return result;
      setData(result);
      setStatus('success');
      return result;
    } catch (e) {
      if (!mounted.current || id !== requestId.current) throw e;
      setError(e as Error);
      setStatus('error');
      throw e;
    }
  }, [fn]);

  const reset = React.useCallback(() => {
    setData(null);
    setError(null);
    setStatus('idle');
  }, []);

  return { data, error, status, execute, reset };
};

export const UseAsyncDemo = ({ fn }: { fn: () => Promise<string> }) => {
  const { data, error, status, execute, reset } = useAsync(fn);
  return (
    <div>
      <button onClick={() => { void execute(); }}>Run</button>
      <button onClick={reset}>Reset</button>
      <p data-testid="status">{status}</p>
      <p data-testid="data">{data ?? ''}</p>
      <p data-testid="error">{error?.message ?? ''}</p>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UseAsyncDemo } from 'user';

export const tests = [
  {
    name: 'initial idle state',
    run: () => {
      render(React.createElement(UseAsyncDemo, { fn: async () => 'ok' }));
      expect(screen.getByTestId('status').textContent).toBe('idle');
    }
  },
  {
    name: 'successful execute sets data and success',
    run: async () => {
      render(React.createElement(UseAsyncDemo, { fn: async () => 'ok' }));
      fireEvent.click(screen.getByText('Run'));
      await new Promise((r) => setTimeout(r, 0));
      expect(screen.getByTestId('status').textContent).toBe('success');
      expect(screen.getByTestId('data').textContent).toBe('ok');
    }
  },
  {
    name: 'failing execute sets error state',
    run: async () => {
      render(React.createElement(UseAsyncDemo, { fn: async () => { throw new Error('bad'); } }));
      fireEvent.click(screen.getByText('Run'));
      await new Promise((r) => setTimeout(r, 0));
      expect(screen.getByTestId('status').textContent).toBe('error');
      expect(screen.getByTestId('error').textContent).toContain('bad');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UseAsyncDemo } from 'user';

export const tests = [
  {
    name: 'stale slower response ignored',
    run: async () => {
      let mode: 'slow' | 'fast' = 'slow';
      const fn = () => new Promise<string>((resolve) => {
        setTimeout(() => resolve(mode), mode === 'slow' ? 30 : 5);
      });
      render(React.createElement(UseAsyncDemo, { fn }));
      fireEvent.click(screen.getByText('Run'));
      mode = 'fast';
      fireEvent.click(screen.getByText('Run'));
      await new Promise((r) => setTimeout(r, 40));
      expect(screen.getByTestId('data').textContent).toBe('fast');
    }
  },
  {
    name: 'reset clears data and error and supports retry',
    run: async () => {
      let n = 0;
      render(React.createElement(UseAsyncDemo, {
        fn: async () => {
          n += 1;
          if (n === 1) throw new Error('first');
          return 'second';
        }
      }));
      fireEvent.click(screen.getByText('Run'));
      await new Promise((r) => setTimeout(r, 0));
      fireEvent.click(screen.getByText('Reset'));
      expect(screen.getByTestId('status').textContent).toBe('idle');
      fireEvent.click(screen.getByText('Run'));
      await new Promise((r) => setTimeout(r, 0));
      expect(screen.getByTestId('data').textContent).toBe('second');
    }
  }
];`
    },
    metadata: {
      timeComplexity: '35-45 min',
      commonPitfalls: ['Stale requests overwriting state', 'No unmount guard', 'Missing reset semantics'],
      recallQuestions: ['Why keep a request id?', 'How should execute expose errors?', 'What does retry mean here?']
    }
  },
  {
    id: 'react-postmessage-checkout-frame',
    title: 'postMessage Checkout Frame',
    difficulty: 'medium',
    topics: ['react-browser-api', 'postMessage', 'origin validation', 'cleanup'],
    promptMarkdown: 'Create a parent component that listens to checkout events from an iframe using postMessage.',
    requirements: ['Render iframe', 'Validate origin', 'Handle STARTED/COMPLETE/ERROR', 'Ignore unknown messages', 'Cleanup listener'],
    constraints: ['Deterministic browser events only'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define accepted origin and message type.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Render iframe.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Register message listener.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Validate origin and message shape.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Handle known event types.
// TODO(step 5 start)
// TODO(step 5 end)


export const CheckoutFrameHost = (_props: { origin: string }) => {
// Step 6: Cleanup listener on unmount.
// TODO(step 6 start)
// TODO(step 6 end)
  return (
    <div>
      <iframe title="checkout-frame" />
      <p data-testid="status">idle</p>
    </div>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type EventType = 'CHECKOUT_STARTED' | 'CHECKOUT_COMPLETE' | 'CHECKOUT_ERROR';

type Message = { type: EventType };

const isKnownType = (value: string): value is EventType => {
  return value === 'CHECKOUT_STARTED' || value === 'CHECKOUT_COMPLETE' || value === 'CHECKOUT_ERROR';
};

export const CheckoutFrameHost = ({ origin }: { origin: string }) => {
  const [status, setStatus] = React.useState('idle');

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const data = event.data as Message;
      if (!data || typeof data.type !== 'string' || !isKnownType(data.type)) return;
      if (data.type === 'CHECKOUT_STARTED') setStatus('started');
      if (data.type === 'CHECKOUT_COMPLETE') setStatus('complete');
      if (data.type === 'CHECKOUT_ERROR') setStatus('error');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [origin]);

  return (
    <div>
      <iframe title="checkout-frame" src="about:blank" />
      <p data-testid="status">{status}</p>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { CheckoutFrameHost } from 'user';

const post = (origin: string, type: string) => {
  window.dispatchEvent(new MessageEvent('message', { origin, data: { type } }));
};

export const tests = [
  {
    name: 'renders iframe',
    run: () => {
      render(React.createElement(CheckoutFrameHost, { origin: 'https://trusted.test' }));
      expect(screen.getByTitle('checkout-frame')).toBeTruthy();
    }
  },
  {
    name: 'valid CHECKOUT_STARTED updates status',
    run: () => {
      render(React.createElement(CheckoutFrameHost, { origin: 'https://trusted.test' }));
      post('https://trusted.test', 'CHECKOUT_STARTED');
      expect(screen.getByTestId('status').textContent).toBe('started');
    }
  },
  {
    name: 'valid CHECKOUT_COMPLETE updates status',
    run: () => {
      render(React.createElement(CheckoutFrameHost, { origin: 'https://trusted.test' }));
      post('https://trusted.test', 'CHECKOUT_COMPLETE');
      expect(screen.getByTestId('status').textContent).toBe('complete');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { CheckoutFrameHost } from 'user';

const post = (origin: string, type: string) => {
  window.dispatchEvent(new MessageEvent('message', { origin, data: { type } }));
};

export const tests = [
  {
    name: 'invalid origin and unknown type are ignored',
    run: () => {
      render(React.createElement(CheckoutFrameHost, { origin: 'https://trusted.test' }));
      post('https://evil.test', 'CHECKOUT_STARTED');
      post('https://trusted.test', 'UNKNOWN');
      expect(screen.getByTestId('status').textContent).toBe('idle');
    }
  },
  {
    name: 'listener removed on unmount',
    run: () => {
      const { unmount } = render(React.createElement(CheckoutFrameHost, { origin: 'https://trusted.test' }));
      unmount();
      // Should not throw or update removed tree
      post('https://trusted.test', 'CHECKOUT_COMPLETE');
      cleanup();
      expect(true).toBe(true);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '25-35 min',
      commonPitfalls: ['Skipping origin validation', 'Assuming message shape', 'Forgetting listener cleanup'],
      recallQuestions: ['Why validate origin first?', 'How do you handle unknown events?', 'What leaks if cleanup is missing?']
    }
  },
  {
    id: 'react-config-payment-messaging',
    title: 'Config-Driven Payment Messaging',
    difficulty: 'easy',
    topics: ['react-component', 'config ui', 'safe rendering', 'themes'],
    promptMarkdown: 'Render payment messaging from config with validation and safe fallback behavior.',
    requirements: ['Validate required headline', 'Render optional fields safely', 'Support light/dark themes', 'Invalid config fallback'],
    constraints: ['Do not use unsafe HTML APIs'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define config shape.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Validate required headline.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Normalize optional fields.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Apply safe theme fallback.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Render safe text content.
// TODO(step 5 start)
// TODO(step 5 end)


export const PaymentMessage = (_props: { config?: { headline?: string; subtext?: string; cta?: string; theme?: string } }) => {
// Step 6: Render fallback for invalid config.
// TODO(step 6 start)
// TODO(step 6 end)
  return (
    <section data-testid="message" data-theme="light">
      <h2></h2>
      <p></p>
      <button></button>
    </section>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

export const PaymentMessage = ({ config }: { config?: { headline?: string; subtext?: string; cta?: string; theme?: string } }) => {
  if (!config || !config.headline || !config.headline.trim()) {
    return <p data-testid="fallback">Messaging unavailable</p>;
  }
  const theme = config.theme === 'dark' ? 'dark' : 'light';
  const subtext = config.subtext ?? '';
  const cta = config.cta ?? '';
  return (
    <section data-testid="message" data-theme={theme}>
      <h2>{config.headline}</h2>
      <p>{subtext}</p>
      <button>{cta}</button>
    </section>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { PaymentMessage } from 'user';

export const tests = [
  {
    name: 'renders headline subtext cta',
    run: () => {
      render(React.createElement(PaymentMessage, { config: { headline: 'Pay over time', subtext: 'Starting at $25/month', cta: 'Learn more', theme: 'light' } }));
      expect(screen.getByText('Pay over time')).toBeTruthy();
      expect(screen.getByText('Starting at $25/month')).toBeTruthy();
      expect(screen.getByText('Learn more')).toBeTruthy();
    }
  },
  {
    name: 'works with optional fields missing',
    run: () => {
      render(React.createElement(PaymentMessage, { config: { headline: 'Pay later' } }));
      expect(screen.getByText('Pay later')).toBeTruthy();
    }
  },
  {
    name: 'applies dark theme',
    run: () => {
      render(React.createElement(PaymentMessage, { config: { headline: 'h', theme: 'dark' } }));
      expect(screen.getByTestId('message').getAttribute('data-theme')).toBe('dark');
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { PaymentMessage } from 'user';

export const tests = [
  {
    name: 'invalid config renders fallback',
    run: () => {
      render(React.createElement(PaymentMessage, { config: {} }));
      expect(screen.getByTestId('fallback').textContent).toContain('unavailable');
    }
  },
  {
    name: 'unsafe html is not executed and unsupported theme falls back',
    run: () => {
      (window as any).__xss = 0;
      render(React.createElement(PaymentMessage, { config: { headline: '<img src=x onerror="window.__xss=1"/>', theme: 'neon' } }));
      expect((window as any).__xss).toBe(0);
      expect(screen.getByTestId('message').getAttribute('data-theme')).toBe('light');
    }
  }
];`
    },
    metadata: {
      timeComplexity: '15-25 min',
      commonPitfalls: ['Rendering unsafe HTML', 'No fallback for invalid config', 'Unbounded theme values'],
      recallQuestions: ['Why default unsupported themes?', 'How do you validate minimal config?', 'Why text rendering is safer?']
    }
  },
  {
    id: 'react-lazy-checkout-modal',
    title: 'Lazy-Loaded Checkout Modal',
    difficulty: 'medium',
    topics: ['react-component', 'react.lazy', 'suspense', 'modal state'],
    promptMarkdown: 'Build a checkout button that lazy-loads modal UI after user click.',
    requirements: ['Button renders first', 'Lazy loader triggers only on click', 'Fallback renders while loading', 'Close support', 'Keep loading fallback test id `fallback` and modal test id `modal`'],
    constraints: ['No backend', 'Use injected loader for deterministic tests'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track open state and checkout state.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Trigger modal loader after click.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Wrap lazy modal in Suspense fallback.
// TODO(step 3 start)
// TODO(step 3 end)


type ModalProps = { amount: number; onClose: () => void };
type Props = { amount: number; loadModal: () => Promise<{ default: React.ComponentType<ModalProps> }> };

export const LazyCheckoutHost: React.FC<Props> = () => {
// Step 4: Render close behavior and keep state stable.
// TODO(step 4 start)
// TODO(step 4 end)
  return (
    <div>
      <button>Open checkout</button>
      <p data-testid="fallback">Loading checkout...</p>
    </div>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type ModalProps = { amount: number; onClose: () => void };
type Props = { amount: number; loadModal: () => Promise<{ default: React.ComponentType<ModalProps> }> };

export const LazyCheckoutHost: React.FC<Props> = ({ amount, loadModal }) => {
  const [open, setOpen] = React.useState(false);
  const [LazyModal, setLazyModal] = React.useState<React.LazyExoticComponent<React.ComponentType<ModalProps>> | null>(null);

  const onOpen = () => {
    if (!LazyModal) setLazyModal(React.lazy(loadModal));
    setOpen(true);
  };

  return (
    <div>
      <button onClick={onOpen}>Open checkout</button>
      {open && LazyModal && (
        <React.Suspense fallback={<p data-testid="fallback">Loading checkout...</p>}>
          <LazyModal amount={amount} onClose={() => setOpen(false)} />
        </React.Suspense>
      )}
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LazyCheckoutHost } from 'user';

const modalFactory = () => ({ default: ({ amount, onClose }: { amount: number; onClose: () => void }) => React.createElement('div', null,
  React.createElement('p', { 'data-testid': 'modal' }, 'Amount:' + amount),
  React.createElement('button', { onClick: onClose }, 'Close')
)});

export const tests = [
  {
    name: 'initial render does not show modal',
    run: () => {
      render(React.createElement(LazyCheckoutHost, { amount: 99, loadModal: async () => modalFactory() }));
      expect(screen.queryByTestId('modal')).toBeNull();
    }
  },
  {
    name: 'click shows fallback then modal',
    run: async () => {
      render(React.createElement(LazyCheckoutHost, { amount: 99, loadModal: async () => { await new Promise((r) => setTimeout(r, 20)); return modalFactory(); } }));
      fireEvent.click(screen.getByText('Open checkout'));
      expect(screen.getByTestId('fallback').textContent).toContain('Loading');
      await new Promise((r) => setTimeout(r, 30));
      expect(screen.getByTestId('modal').textContent).toContain('99');
    }
  },
  {
    name: 'close hides modal',
    run: async () => {
      render(React.createElement(LazyCheckoutHost, { amount: 50, loadModal: async () => modalFactory() }));
      fireEvent.click(screen.getByText('Open checkout'));
      await new Promise((r) => setTimeout(r, 0));
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('modal')).toBeNull();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LazyCheckoutHost } from 'user';

export const tests = [
  {
    name: 'loader not invoked before click',
    run: () => {
      let count = 0;
      render(React.createElement(LazyCheckoutHost, {
        amount: 10,
        loadModal: async () => {
          count += 1;
          return { default: () => React.createElement('div', { 'data-testid': 'modal' }, 'x') };
        }
      }));
      expect(count).toBe(0);
    }
  },
  {
    name: 'state preserved and repeated open close works',
    run: async () => {
      const Comp = ({ amount, onClose }: { amount: number; onClose: () => void }) => React.createElement('div', null,
        React.createElement('p', { 'data-testid': 'modal' }, 'Amount:' + amount),
        React.createElement('button', { onClick: onClose }, 'Close')
      );
      render(React.createElement(LazyCheckoutHost, { amount: 77, loadModal: async () => ({ default: Comp }) }));
      fireEvent.click(screen.getByText('Open checkout'));
      await new Promise((r) => setTimeout(r, 0));
      expect(screen.getByTestId('modal').textContent).toContain('77');
      fireEvent.click(screen.getByText('Close'));
      fireEvent.click(screen.getByText('Open checkout'));
      await new Promise((r) => setTimeout(r, 0));
      expect(screen.getByTestId('modal').textContent).toContain('77');
    }
  }
];`
    },
    metadata: {
      timeComplexity: '30-40 min',
      commonPitfalls: ['Triggering lazy loader on initial render', 'Missing fallback UI', 'Dropping state across modal loads'],
      recallQuestions: ['When is lazy-load a good UX tradeoff?', 'How do you verify loader invocation timing?', 'How does Suspense fallback improve UX?']
    }
  },
  {
    id: 'web-vitals-interaction-tracker',
    title: 'Web Vitals Style Interaction Tracker',
    difficulty: 'easy',
    topics: ['javascript-utility', 'instrumentation', 'latency tracking'],
    promptMarkdown: 'Measure interaction latency from click to async completion and log a metric.',
    requirements: ['Capture start/end time', 'Run async work', 'Log metric once', 'Handle failures'],
    constraints: ['Use injected now() and logger for deterministic tests'],
    guidedStubTsx: `export const trackInteraction = async (
  _name: string,
  _work: () => Promise<string>,
  _log: (name: string, duration: number, status: 'success' | 'error') => void,
  _now: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
) => {
  // Step 1: Capture start time.
  // TODO(step 1 start)
  // TODO(step 1 end)

  // Step 2: Run async work and wait for completion.
  // TODO(step 2 start)
  // TODO(step 2 end)

  // Step 3: Capture end time and compute duration.
  // TODO(step 3 start)
  // TODO(step 3 end)

  // Step 4: Log metric once per interaction.
  // TODO(step 4 start)
  // TODO(step 4 end)

  // Step 5: Handle rejection path.
  // TODO(step 5 start)
  // TODO(step 5 end)
  return;
};`,
    referenceSolutionTsx: `export const trackInteraction = async (
  name: string,
  work: () => Promise<string>,
  log: (name: string, duration: number, status: 'success' | 'error') => void,
  now: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
) => {
  const start = now();
  try {
    const result = await work();
    const duration = now() - start;
    log(name, duration, 'success');
    return result;
  } catch (e) {
    const duration = now() - start;
    log(name, duration, 'error');
    throw e;
  }
};`,
    tests: {
      visible: `import { trackInteraction } from 'user';

export const tests = [
  {
    name: 'logs elapsed duration after success',
    run: async () => {
      const logs: Array<{ name: string; duration: number; status: string }> = [];
      let t = 10;
      const now = () => t;
      const result = await trackInteraction('checkout', async () => {
        t = 25;
        return 'ok';
      }, (name, duration, status) => logs.push({ name, duration, status }), now);
      expect(result).toBe('ok');
      expect(logs.length).toBe(1);
      expect(logs[0].duration).toBe(15);
    }
  },
  {
    name: 'does not log before work completes',
    run: async () => {
      const logs: unknown[] = [];
      let resolve!: () => void;
      const promise = new Promise<string>((r) => { resolve = () => r('ok'); });
      const run = trackInteraction('x', () => promise, (...args) => logs.push(args), () => 5);
      expect(logs.length).toBe(0);
      resolve();
      await run;
      expect(logs.length).toBe(1);
    }
  },
  {
    name: 'returns async result',
    run: async () => {
      const result = await trackInteraction('x', async () => 'done', () => {}, () => 1);
      expect(result).toBe('done');
    }
  }
];`,
      hidden: `import { trackInteraction } from 'user';

export const tests = [
  {
    name: 'handles rejected async work',
    run: async () => {
      const logs: Array<{ status: string }> = [];
      let threw = false;
      try {
        await trackInteraction('x', async () => { throw new Error('bad'); }, (_n, _d, status) => logs.push({ status }), () => 1);
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
      expect(logs[0].status).toBe('error');
    }
  },
  {
    name: 'logs once per interaction',
    run: async () => {
      const logs: unknown[] = [];
      await trackInteraction('a', async () => '1', (...args) => logs.push(args), () => 1);
      expect(logs.length).toBe(1);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '15-25 min',
      commonPitfalls: ['Using Date.now without injection in tests', 'Logging before completion', 'Double logging on errors'],
      recallQuestions: ['Why inject now()?', 'Where should metric be emitted?', 'How do you classify failed interactions?']
    }
  },
  {
    id: 'idempotent-script-loader',
    title: 'Idempotent Script Loader',
    difficulty: 'medium',
    topics: ['javascript-utility', 'promises', 'idempotency', 'timeouts'],
    promptMarkdown: 'Implement `loadScript(src)` that returns a shared promise per src and supports timeout + retry after failure.',
    requirements: ['Cache by src', 'Return same promise for duplicate calls', 'Resolve on load', 'Reject on error or timeout', 'Clear failed cache'],
    constraints: ['No external libraries'],
    guidedStubTsx: `export const loadScript = (_src: string, _timeoutMs = 1000) => {
  // Step 1: Add src->promise cache.
  // TODO(step 1 start)
  // TODO(step 1 end)

  // Step 2: Return cached promise for duplicate src.
  // TODO(step 2 start)
  // TODO(step 2 end)

  // Step 3: Create script element and handlers.
  // TODO(step 3 start)
  // TODO(step 3 end)

  // Step 4: Handle timeout and cleanup.
  // TODO(step 4 start)
  // TODO(step 4 end)

  // Step 5: Remove failed cache entry for retry.
  // TODO(step 5 start)
  // TODO(step 5 end)
  return;
};`,
    referenceSolutionTsx: `const cache = new Map<string, Promise<void>>();

export const loadScript = (src: string, timeoutMs = 1000) => {
  const cached = cache.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;

    const cleanup = () => {
      script.onload = null;
      script.onerror = null;
      if (timer) clearTimeout(timer);
    };

    script.onload = () => {
      cleanup();
      resolve();
    };

    script.onerror = () => {
      cleanup();
      cache.delete(src);
      reject(new Error('Script failed'));
    };

    const timer = window.setTimeout(() => {
      cleanup();
      cache.delete(src);
      reject(new Error('Script timeout'));
    }, timeoutMs);

    document.head.appendChild(script);
  });

  cache.set(src, promise);
  return promise;
};`,
    tests: {
      visible: `import { loadScript } from 'user';

export const tests = [
  {
    name: 'creates script element for new src',
    run: () => {
      document.head.innerHTML = '';
      void loadScript('https://cdn.example/a.js', 200);
      expect(document.querySelectorAll('script[src="https://cdn.example/a.js"]').length).toBe(1);
    }
  },
  {
    name: 'duplicate calls share same promise and single script',
    run: () => {
      document.head.innerHTML = '';
      const p1 = loadScript('https://cdn.example/b.js', 200);
      const p2 = loadScript('https://cdn.example/b.js', 200);
      expect(p1).toBe(p2);
      expect(document.querySelectorAll('script[src="https://cdn.example/b.js"]').length).toBe(1);
    }
  },
  {
    name: 'resolves on load event',
    run: async () => {
      document.head.innerHTML = '';
      const p = loadScript('https://cdn.example/c.js', 200);
      const el = document.querySelector('script[src="https://cdn.example/c.js"]') as HTMLScriptElement;
      el.dispatchEvent(new Event('load'));
      await p;
      expect(true).toBe(true);
    }
  }
];`,
      hidden: `import { loadScript } from 'user';

export const tests = [
  {
    name: 'rejects on error event',
    run: async () => {
      document.head.innerHTML = '';
      const p = loadScript('https://cdn.example/d.js', 200);
      const el = document.querySelector('script[src="https://cdn.example/d.js"]') as HTMLScriptElement;
      el.dispatchEvent(new Event('error'));
      let threw = false;
      try { await p; } catch { threw = true; }
      expect(threw).toBe(true);
    }
  },
  {
    name: 'retry after failure creates new script',
    run: async () => {
      document.head.innerHTML = '';
      const p1 = loadScript('https://cdn.example/e.js', 200);
      const first = document.querySelector('script[src="https://cdn.example/e.js"]') as HTMLScriptElement;
      first.dispatchEvent(new Event('error'));
      try { await p1; } catch {}
      const p2 = loadScript('https://cdn.example/e.js', 200);
      const scripts = document.querySelectorAll('script[src="https://cdn.example/e.js"]');
      expect(scripts.length).toBe(2);
      (scripts[1] as HTMLScriptElement).dispatchEvent(new Event('load'));
      await p2;
      expect(true).toBe(true);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '30-40 min',
      commonPitfalls: ['Not sharing promise for duplicate src', 'No timeout cleanup', 'Keeping failed promises in cache'],
      recallQuestions: ['Why cache promise not script node?', 'What should happen on timeout?', 'How do you enable retries after failure?']
    }
  },
  {
    id: 'react-error-boundary-payment-ui',
    title: 'Error Boundary for Payment UI',
    difficulty: 'medium',
    topics: ['react-component', 'error boundaries', 'fallback ui', 'retry remount'],
    promptMarkdown: 'Implement a class ErrorBoundary for checkout widgets with logging and retry/remount behavior.',
    requirements: ['Catch render errors', 'Render fallback', 'Log errors', 'Retry remounts child', 'Keep stable test ids `ok` and `fallback`'],
    constraints: ['Use class component boundary'],
    guidedStubTsx: `import React from 'react';

// Step 1: Create class boundary and hasError state.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Implement getDerivedStateFromError.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Implement componentDidCatch logger.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Render fallback UI.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Implement retry by reset/remount.
// TODO(step 5 start)
// TODO(step 5 end)

export class PaymentErrorBoundary extends React.Component<{ logger?: (e: Error) => void; children: React.ReactNode }, { hasError: boolean; nonce: number }> {
  constructor(props: { logger?: (e: Error) => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, nonce: 0 };
  }

  render() {
    return this.props.children;
  }
}

export const UnstableCheckout = ({ crash }: { crash: boolean }) => {
  if (crash) throw new Error('boom');
  return <p data-testid="ok">ok</p>;
};`,
    referenceSolutionTsx: `import React from 'react';

export class PaymentErrorBoundary extends React.Component<{ logger?: (e: Error) => void; children: React.ReactNode }, { hasError: boolean; nonce: number }> {
  constructor(props: { logger?: (e: Error) => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, nonce: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.logger?.(error);
  }

  retry = () => {
    this.setState((s) => ({ hasError: false, nonce: s.nonce + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p data-testid="fallback">Something went wrong</p>
          <button onClick={this.retry}>Retry</button>
        </div>
      );
    }
    return <React.Fragment key={this.state.nonce}>{this.props.children}</React.Fragment>;
  }
}

export const UnstableCheckout = ({ crash }: { crash: boolean }) => {
  if (crash) throw new Error('boom');
  return <p data-testid="ok">ok</p>;
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { PaymentErrorBoundary, UnstableCheckout } from 'user';

export const tests = [
  {
    name: 'renders children when no error',
    run: () => {
      render(React.createElement(PaymentErrorBoundary, null, React.createElement(UnstableCheckout, { crash: false })));
      expect(screen.getByTestId('ok').textContent).toBe('ok');
    }
  },
  {
    name: 'catches child render error and shows fallback',
    run: () => {
      render(React.createElement(PaymentErrorBoundary, null, React.createElement(UnstableCheckout, { crash: true })));
      expect(screen.getByTestId('fallback').textContent).toContain('went wrong');
    }
  },
  {
    name: 'logs error',
    run: () => {
      let count = 0;
      render(React.createElement(PaymentErrorBoundary, { logger: () => { count += 1; } }, React.createElement(UnstableCheckout, { crash: true })));
      expect(count).toBe(1);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentErrorBoundary, UnstableCheckout } from 'user';

export const tests = [
  {
    name: 'retry remounts child',
    run: () => {
      const App = () => {
        const [crash, setCrash] = React.useState(true);
        return React.createElement('div', null,
          React.createElement('button', { onClick: () => setCrash(false) }, 'fix'),
          React.createElement(PaymentErrorBoundary, null, React.createElement(UnstableCheckout, { crash }))
        );
      };
      render(React.createElement(App));
      expect(screen.getByTestId('fallback')).toBeTruthy();
      fireEvent.click(screen.getByText('fix'));
      fireEvent.click(screen.getByText('Retry'));
      expect(screen.getByTestId('ok').textContent).toBe('ok');
    }
  },
  {
    name: 'logger called once per error cycle',
    run: () => {
      let count = 0;
      render(React.createElement(PaymentErrorBoundary, { logger: () => { count += 1; } }, React.createElement(UnstableCheckout, { crash: true })));
      expect(count).toBe(1);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '25-35 min',
      commonPitfalls: ['Using function component boundary', 'No retry path', 'Logging multiple times unintentionally'],
      recallQuestions: ['Why must ErrorBoundary be class-based?', 'How do you remount children safely?', 'What should fallback message include?']
    }
  },
  {
    id: 'mini-event-emitter-sdk',
    title: 'Mini Event Emitter',
    difficulty: 'medium',
    topics: ['javascript-utility', 'events', 'subscriptions', 'error isolation'],
    promptMarkdown: 'Implement a tiny event emitter with on/off/once/emit and resilient handler iteration.',
    requirements: ['Multiple handlers', 'once support', 'off safety', 'handler errors isolated'],
    constraints: ['No external libs'],
    guidedStubTsx: `export class MiniEmitter {
  // Step 1: Store handlers by event.
  // TODO(step 1 start)
  // TODO(step 1 end)

  // Step 2: Implement on and return unsubscribe.
  // TODO(step 2 start)
  // TODO(step 2 end)
  on(_event: string, _handler: (payload: unknown) => void) {
    return () => {};
  }

  // Step 3: Implement off safely.
  // TODO(step 3 start)
  // TODO(step 3 end)
  off(_event: string, _handler: (payload: unknown) => void) {}

  // Step 4: Implement emit with defensive iteration.
  // TODO(step 4 start)
  // TODO(step 4 end)

  // Step 5: Guard handler errors.
  // TODO(step 5 start)
  // TODO(step 5 end)
  emit(_event: string, _payload: unknown) {}

  // Step 6: Implement once.
  // TODO(step 6 start)
  // TODO(step 6 end)
  once(_event: string, _handler: (payload: unknown) => void) {
    return () => {};
  }
}`,
    referenceSolutionTsx: `export class MiniEmitter {
  private events = new Map<string, Set<(payload: unknown) => void>>();

  on(event: string, handler: (payload: unknown) => void) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)?.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: (payload: unknown) => void) {
    this.events.get(event)?.delete(handler);
  }

  emit(event: string, payload: unknown) {
    const handlers = Array.from(this.events.get(event) ?? []);
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch {
        // isolate handler errors
      }
    });
  }

  once(event: string, handler: (payload: unknown) => void) {
    const wrapped = (payload: unknown) => {
      this.off(event, wrapped);
      handler(payload);
    };
    return this.on(event, wrapped);
  }
}`,
    tests: {
      visible: `import { MiniEmitter } from 'user';

export const tests = [
  {
    name: 'multiple handlers receive payload',
    run: () => {
      const e = new MiniEmitter();
      const out: number[] = [];
      e.on('x', (v) => out.push(v as number));
      e.on('x', (v) => out.push((v as number) + 1));
      e.emit('x', 1);
      expect(out.join(',')).toBe('1,2');
    }
  },
  {
    name: 'off removes handler',
    run: () => {
      const e = new MiniEmitter();
      let count = 0;
      const h = () => { count += 1; };
      e.on('x', h);
      e.off('x', h);
      e.emit('x', null);
      expect(count).toBe(0);
    }
  },
  {
    name: 'once runs once',
    run: () => {
      const e = new MiniEmitter();
      let count = 0;
      e.once('x', () => { count += 1; });
      e.emit('x', null);
      e.emit('x', null);
      expect(count).toBe(1);
    }
  }
];`,
      hidden: `import { MiniEmitter } from 'user';

export const tests = [
  {
    name: 'handler error does not stop others',
    run: () => {
      const e = new MiniEmitter();
      let count = 0;
      e.on('x', () => { throw new Error('bad'); });
      e.on('x', () => { count += 1; });
      e.emit('x', null);
      expect(count).toBe(1);
    }
  },
  {
    name: 'unsubscribe from on works and mutation during emit safe',
    run: () => {
      const e = new MiniEmitter();
      let c1 = 0;
      let c2 = 0;
      const off = e.on('x', () => { c1 += 1; off(); });
      e.on('x', () => { c2 += 1; });
      e.emit('x', null);
      e.emit('x', null);
      expect(c1).toBe(1);
      expect(c2).toBe(2);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '25-35 min',
      commonPitfalls: ['Mutating handlers while iterating', 'No once cleanup', 'Emitter crashes on handler exceptions'],
      recallQuestions: ['Why iterate over a copy?', 'How do you implement once safely?', 'What should off do for unknown handlers?']
    }
  },
  {
    id: 'feature-flagged-checkout-component',
    title: 'Feature Flagged Checkout Component',
    difficulty: 'easy',
    topics: ['react-component', 'feature flags', 'safe defaults', 'conditional rendering'],
    promptMarkdown: 'Build a checkout component with safe default flags and optional experiment logging.',
    requirements: ['Default behavior without flags', 'Ignore unknown flags', 'Conditional new messaging + express checkout', 'Optional logging'],
    constraints: ['No external libs'],
    guidedStubTsx: `import React from 'react';

// Step 1: Define default flags.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Merge incoming flags with defaults.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Render default checkout UI.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Conditionally render new messaging and express checkout.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Log enabled flags when logging is enabled.
// TODO(step 5 start)
// TODO(step 5 end)

type Flags = { enableNewMessaging?: boolean; enableExpressCheckout?: boolean; enableExperimentLogging?: boolean };

export const FlaggedCheckout = (_props: { flags?: Flags; logger?: (enabled: string[]) => void }) => {
  return (
    <section>
      <p data-testid="default">Checkout</p>
      <p data-testid="new-msg">Pay over time available</p>
      <button>Express checkout</button>
    </section>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type Flags = { enableNewMessaging?: boolean; enableExpressCheckout?: boolean; enableExperimentLogging?: boolean };

const defaults: Required<Flags> = {
  enableNewMessaging: false,
  enableExpressCheckout: false,
  enableExperimentLogging: false
};

export const FlaggedCheckout = ({ flags, logger }: { flags?: Flags; logger?: (enabled: string[]) => void }) => {
  const merged = { ...defaults, ...(flags ?? {}) };
  React.useEffect(() => {
    if (!merged.enableExperimentLogging) return;
    const enabled = Object.entries(merged).filter(([, v]) => v).map(([k]) => k);
    logger?.(enabled);
  }, [merged.enableExperimentLogging, merged.enableExpressCheckout, merged.enableNewMessaging, logger]);

  return (
    <section>
      <p data-testid="default">Checkout</p>
      {merged.enableNewMessaging && <p data-testid="new-msg">Pay over time available</p>}
      {merged.enableExpressCheckout && <button>Express checkout</button>}
    </section>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { FlaggedCheckout } from 'user';

export const tests = [
  {
    name: 'default behavior works without flags',
    run: () => {
      render(React.createElement(FlaggedCheckout));
      expect(screen.getByTestId('default').textContent).toBe('Checkout');
      expect(screen.queryByTestId('new-msg')).toBeNull();
    }
  },
  {
    name: 'new messaging appears when enabled',
    run: () => {
      render(React.createElement(FlaggedCheckout, { flags: { enableNewMessaging: true } }));
      expect(screen.getByTestId('new-msg').textContent).toContain('Pay over time');
    }
  },
  {
    name: 'express checkout appears when enabled',
    run: () => {
      render(React.createElement(FlaggedCheckout, { flags: { enableExpressCheckout: true } }));
      expect(screen.getByText('Express checkout')).toBeTruthy();
    }
  }
];`,
      hidden: `import React from 'react';
import { render } from '@testing-library/react';
import { FlaggedCheckout } from 'user';

export const tests = [
  {
    name: 'unsupported flags ignored and missing flags does not crash',
    run: () => {
      render(React.createElement(FlaggedCheckout, { flags: ({ x: true } as any) }));
      render(React.createElement(FlaggedCheckout, {}));
      expect(true).toBe(true);
    }
  },
  {
    name: 'logging includes enabled flags only when enabled',
    run: () => {
      let enabled: string[] = [];
      render(React.createElement(FlaggedCheckout, {
        flags: { enableNewMessaging: true, enableExperimentLogging: true },
        logger: (arr) => { enabled = arr; }
      }));
      expect(enabled.includes('enableNewMessaging')).toBe(true);
      expect(enabled.includes('enableExperimentLogging')).toBe(true);
    }
  }
];`
    },
    metadata: {
      timeComplexity: '15-25 min',
      commonPitfalls: ['No safe defaults', 'Assuming flags object exists', 'Logging regardless of logging flag'],
      recallQuestions: ['How do you keep flags backward-compatible?', 'Why ignore unknown flags?', 'When should experiment logging fire?']
    }
  },
  {
    id: 'payment-option-selector',
    title: 'Payment Option Selector',
    difficulty: 'medium',
    topics: ['react-component', 'accessibility', 'keyboard navigation', 'state modeling'],
    promptMarkdown: 'Build a payment plan selector with disabled options and keyboard/radio-group semantics.',
    requirements: ['Render plans', 'Select available plans', 'Disable unavailable plans', 'Keyboard nav', 'Selected summary'],
    constraints: ['Accessible roles/labels required'],
    guidedStubTsx: `import React from 'react';

// Step 1: Render plans and track selected id.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Prevent unavailable selections.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Render selected summary.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Add radio-group accessibility semantics.
// TODO(step 4 start)
// TODO(step 4 end)


type Plan = { id: string; label: string; available: boolean };

export const PaymentOptionSelector = (_props: { plans: Plan[] }) => {
// Step 5: Implement keyboard navigation.
// TODO(step 5 start)
// TODO(step 5 end)
  return (
    <section>
      <div role="radiogroup"></div>
      <p data-testid="summary">none</p>
    </section>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type Plan = { id: string; label: string; available: boolean };

export const PaymentOptionSelector = ({ plans }: { plans: Plan[] }) => {
  const firstAvailable = plans.find((p) => p.available)?.id ?? '';
  const [selected, setSelected] = React.useState(firstAvailable);

  const indexById = plans.findIndex((p) => p.id === selected);

  const selectAt = (index: number) => {
    const plan = plans[index];
    if (!plan || !plan.available) return;
    setSelected(plan.id);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!plans.length) return;
    if (event.key === 'ArrowRight') {
      for (let i = indexById + 1; i < plans.length; i += 1) {
        if (plans[i].available) return selectAt(i);
      }
    }
    if (event.key === 'ArrowLeft') {
      for (let i = indexById - 1; i >= 0; i -= 1) {
        if (plans[i].available) return selectAt(i);
      }
    }
  };

  const selectedPlan = plans.find((p) => p.id === selected);

  return (
    <div>
      <div role="radiogroup" aria-label="Payment options" onKeyDown={onKeyDown}>
        {plans.map((plan) => (
          <button
            key={plan.id}
            role="radio"
            aria-checked={selected === plan.id}
            aria-label={plan.label}
            disabled={!plan.available}
            onClick={() => { if (plan.available) setSelected(plan.id); }}
          >
            {plan.label}
          </button>
        ))}
      </div>
      <p data-testid="summary">{selectedPlan ? selectedPlan.label : 'none'}</p>
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentOptionSelector } from 'user';

const plans = [
  { id: 'p1', label: 'Pay now', available: true },
  { id: 'p2', label: 'Pay in 4', available: false },
  { id: 'p3', label: 'Monthly', available: true }
];

export const tests = [
  {
    name: 'renders payment plans',
    run: () => {
      render(React.createElement(PaymentOptionSelector, { plans }));
      expect(screen.getByText('Pay now')).toBeTruthy();
      expect(screen.getByText('Pay in 4')).toBeTruthy();
    }
  },
  {
    name: 'clicking available plan selects it',
    run: () => {
      render(React.createElement(PaymentOptionSelector, { plans }));
      fireEvent.click(screen.getByText('Monthly'));
      expect(screen.getByTestId('summary').textContent).toBe('Monthly');
    }
  },
  {
    name: 'unavailable plan cannot be selected',
    run: () => {
      render(React.createElement(PaymentOptionSelector, { plans }));
      const unavailable = screen.getByText('Pay in 4') as HTMLButtonElement;
      expect(unavailable.disabled).toBe(true);
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentOptionSelector } from 'user';

const plans = [
  { id: 'p1', label: 'Pay now', available: true },
  { id: 'p2', label: 'Pay in 4', available: false },
  { id: 'p3', label: 'Monthly', available: true }
];

export const tests = [
  {
    name: 'keyboard navigation updates selection',
    run: () => {
      render(React.createElement(PaymentOptionSelector, { plans }));
      const group = screen.getByRole('radiogroup');
      fireEvent.keyDown(group, { key: 'ArrowRight' });
      expect(screen.getByTestId('summary').textContent).toBe('Monthly');
    }
  },
  {
    name: 'accessible role/name queries work',
    run: () => {
      render(React.createElement(PaymentOptionSelector, { plans }));
      expect(screen.getByRole('radio', { name: 'Pay now' })).toBeTruthy();
      expect(screen.getByRole('radiogroup', { name: 'Payment options' })).toBeTruthy();
    }
  }
];`
    },
    metadata: {
      timeComplexity: '30-40 min',
      commonPitfalls: ['Selecting disabled plans', 'No keyboard support', 'Missing radio-group semantics'],
      recallQuestions: ['How do you model unavailable options?', 'What ARIA roles are needed?', 'How should keyboard movement skip disabled items?']
    }
  },
  {
    id: 'large-merchant-table',
    title: 'Large Merchant Table',
    difficulty: 'medium',
    topics: ['react-component', 'filtering', 'sorting', 'memoization'],
    promptMarkdown: 'Build a merchant table with status filter, name search, and volume sorting.',
    requirements: ['Filter by status', 'Search by merchant name', 'Sort by volume', 'Empty state', 'Memoized derived rows'],
    constraints: ['No external table libs'],
    guidedStubTsx: `import React from 'react';

// Step 1: Track search, status filter, and sort direction.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Derive visible merchants from inputs.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Filter by status and name.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Sort by volume and render rows.
// TODO(step 4 start)
// TODO(step 4 end)


type Merchant = { id: string; name: string; status: 'active' | 'paused'; volume: number };

export const MerchantTable = (_props: { merchants: Merchant[] }) => {
// Step 5: Render empty state.
// TODO(step 5 start)
// TODO(step 5 end)
  return (
    <section>
      <input aria-label="search merchants" />
      <select aria-label="status filter">
        <option value="all">all</option>
      </select>
      <table><tbody></tbody></table>
      <p data-testid="empty">No merchants</p>
    </section>
  );
};`,
    referenceSolutionTsx: `import React from 'react';

type Merchant = { id: string; name: string; status: 'active' | 'paused'; volume: number };

export const MerchantTable = ({ merchants }: { merchants: Merchant[] }) => {
  const [status, setStatus] = React.useState<'all' | 'active' | 'paused'>('all');
  const [search, setSearch] = React.useState('');
  const [dir, setDir] = React.useState<'asc' | 'desc'>('desc');

  const rows = React.useMemo(() => {
    const filtered = merchants.filter((m) => (status === 'all' ? true : m.status === status))
      .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => (dir === 'asc' ? a.volume - b.volume : b.volume - a.volume));
    return filtered;
  }, [merchants, status, search, dir]);

  return (
    <div>
      <input aria-label="search merchants" value={search} onChange={(e) => setSearch(e.target.value)} />
      <select aria-label="status filter" value={status} onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'paused')}>
        <option value="all">all</option>
        <option value="active">active</option>
        <option value="paused">paused</option>
      </select>
      <button onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))}>Sort volume</button>
      {rows.length === 0 ? (
        <p data-testid="empty">No merchants</p>
      ) : (
        <table>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.status}</td>
                <td>{m.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};`,
    tests: {
      visible: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MerchantTable } from 'user';

const merchants = [
  { id: '1', name: 'Alpha', status: 'active', volume: 200 },
  { id: '2', name: 'Beta', status: 'paused', volume: 50 },
  { id: '3', name: 'Gamma', status: 'active', volume: 100 }
] as const;

export const tests = [
  {
    name: 'renders merchants',
    run: () => {
      render(React.createElement(MerchantTable, { merchants: merchants as any }));
      expect(screen.getByText('Alpha')).toBeTruthy();
      expect(screen.getByText('Beta')).toBeTruthy();
    }
  },
  {
    name: 'filters by status',
    run: () => {
      render(React.createElement(MerchantTable, { merchants: merchants as any }));
      fireEvent.change(screen.getByLabelText('status filter'), { target: { value: 'paused' } });
      expect(screen.queryByText('Alpha')).toBeNull();
      expect(screen.getByText('Beta')).toBeTruthy();
    }
  },
  {
    name: 'searches by name',
    run: () => {
      render(React.createElement(MerchantTable, { merchants: merchants as any }));
      fireEvent.change(screen.getByLabelText('search merchants'), { target: { value: 'gam' } });
      expect(screen.getByText('Gamma')).toBeTruthy();
      expect(screen.queryByText('Alpha')).toBeNull();
    }
  }
];`,
      hidden: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MerchantTable } from 'user';

const merchants = [
  { id: '1', name: 'Alpha', status: 'active', volume: 200 },
  { id: '2', name: 'Beta', status: 'paused', volume: 50 },
  { id: '3', name: 'Gamma', status: 'active', volume: 100 }
] as const;

export const tests = [
  {
    name: 'sort by volume both directions and combined filter search',
    run: () => {
      render(React.createElement(MerchantTable, { merchants: merchants as any }));
      fireEvent.change(screen.getByLabelText('status filter'), { target: { value: 'active' } });
      fireEvent.change(screen.getByLabelText('search merchants'), { target: { value: 'a' } });
      const cells = Array.from(document.querySelectorAll('tbody tr td:first-child')).map((el) => el.textContent);
      expect(cells[0]).toBe('Alpha');
      fireEvent.click(screen.getByText('Sort volume'));
      const cellsAsc = Array.from(document.querySelectorAll('tbody tr td:first-child')).map((el) => el.textContent);
      expect(cellsAsc[0]).toBe('Gamma');
    }
  },
  {
    name: 'empty state appears when no match',
    run: () => {
      render(React.createElement(MerchantTable, { merchants: merchants as any }));
      fireEvent.change(screen.getByLabelText('search merchants'), { target: { value: 'zzz' } });
      expect(screen.getByTestId('empty').textContent).toContain('No merchants');
    }
  }
];`
    },
    metadata: {
      timeComplexity: '30-45 min',
      commonPitfalls: ['Mutating props array without copy', 'Missing combined filter+search behavior', 'No empty state'],
      recallQuestions: ['Why memoize derived rows?', 'What order should derive pipeline follow?', 'When would virtualization be needed?']
    }
  },
  {
    id: 'retryable-checkout-request',
    title: 'Retryable Checkout Request',
    difficulty: 'medium',
    topics: ['javascript-utility', 'retry', 'exponential backoff', 'resiliency'],
    promptMarkdown: 'Implement checkout-session creation with retries for transient failures and non-retry for validation errors.',
    requirements: ['Retry up to 3 attempts', 'Exponential backoff', 'Skip retry for validation errors', 'Preserve final error'],
    constraints: ['Inject sleep for deterministic tests'],
    guidedStubTsx: `// Step 1: Detect retryable vs non-retryable errors.
// TODO(step 1 start)
// TODO(step 1 end)

// Step 2: Track attempts and call createCheckoutSession.
// TODO(step 2 start)
// TODO(step 2 end)

// Step 3: Return success immediately.
// TODO(step 3 start)
// TODO(step 3 end)

// Step 4: Stop on validation errors.
// TODO(step 4 start)
// TODO(step 4 end)

// Step 5: Backoff before retry.
// TODO(step 5 start)
// TODO(step 5 end)

// Step 6: Preserve final error after max retries.
// TODO(step 6 start)
// TODO(step 6 end)

type CheckoutError = Error & { code?: string };

export const createCheckoutWithRetry = async (
  _createCheckoutSession: () => Promise<string>,
  _sleep: (ms: number) => Promise<void> = async () => {}
) => {
  return;
};`,
    referenceSolutionTsx: `type CheckoutError = Error & { code?: string };

const isRetryable = (error: CheckoutError) => error.code !== 'VALIDATION';

export const createCheckoutWithRetry = async (
  createCheckoutSession: () => Promise<string>,
  sleep: (ms: number) => Promise<void> = async () => {}
) => {
  const maxAttempts = 3;
  let attempt = 0;
  let lastError: CheckoutError | null = null;

  while (attempt < maxAttempts) {
    try {
      return await createCheckoutSession();
    } catch (e) {
      const err = e as CheckoutError;
      lastError = err;
      attempt += 1;
      if (!isRetryable(err) || attempt >= maxAttempts) {
        throw err;
      }
      const waitMs = 10 * Math.pow(2, attempt - 1);
      await sleep(waitMs);
    }
  }

  throw (lastError ?? new Error('Unknown failure'));
};`,
    tests: {
      visible: `import { createCheckoutWithRetry } from 'user';

export const tests = [
  {
    name: 'succeeds without retry',
    run: async () => {
      const result = await createCheckoutWithRetry(async () => 'session-1');
      expect(result).toBe('session-1');
    }
  },
  {
    name: 'retries transient failure then succeeds',
    run: async () => {
      let n = 0;
      const result = await createCheckoutWithRetry(async () => {
        n += 1;
        if (n < 3) {
          const err = new Error('tmp') as Error & { code?: string };
          err.code = 'TRANSIENT';
          throw err;
        }
        return 'ok';
      }, async () => {});
      expect(result).toBe('ok');
      expect(n).toBe(3);
    }
  },
  {
    name: 'does not retry validation error',
    run: async () => {
      let n = 0;
      let threw = false;
      try {
        await createCheckoutWithRetry(async () => {
          n += 1;
          const err = new Error('bad') as Error & { code?: string };
          err.code = 'VALIDATION';
          throw err;
        }, async () => {});
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
      expect(n).toBe(1);
    }
  }
];`,
      hidden: `import { createCheckoutWithRetry } from 'user';

export const tests = [
  {
    name: 'stops after max retries and preserves final error',
    run: async () => {
      let n = 0;
      let message = '';
      try {
        await createCheckoutWithRetry(async () => {
          n += 1;
          const err = new Error('still failing ' + n) as Error & { code?: string };
          err.code = 'TRANSIENT';
          throw err;
        }, async () => {});
      } catch (e) {
        message = (e as Error).message;
      }
      expect(n).toBe(3);
      expect(message).toContain('still failing 3');
    }
  },
  {
    name: 'backoff durations are exponential',
    run: async () => {
      const waits: number[] = [];
      let n = 0;
      try {
        await createCheckoutWithRetry(async () => {
          n += 1;
          const err = new Error('x') as Error & { code?: string };
          err.code = 'TRANSIENT';
          throw err;
        }, async (ms) => { waits.push(ms); });
      } catch {}
      expect(waits.join(',')).toBe('10,20');
    }
  }
];`
    },
    metadata: {
      timeComplexity: '25-35 min',
      commonPitfalls: ['Retrying validation errors', 'Incorrect backoff schedule', 'Dropping final error context'],
      recallQuestions: ['How do you classify retryable failures?', 'Why inject sleep in tests?', 'How do you prove backoff timing?']
    }
  }
];
