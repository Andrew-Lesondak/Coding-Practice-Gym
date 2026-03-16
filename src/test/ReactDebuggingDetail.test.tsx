import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ReactDebuggingDetail from '../pages/ReactDebuggingDetail';

const runPreview = vi.fn().mockResolvedValue({ ok: true, logs: [], dispose: vi.fn() });
const runTests = vi.fn().mockResolvedValue({ ok: false, results: [{ name: 'visible', passed: false, error: 'boom' }], logs: [] });
const submitSolution = vi.fn().mockResolvedValue({ ok: true, results: [{ name: 'submit', passed: true }], logs: [] });

vi.mock('../lib/reactDebuggingRunner', async () => {
  const actual = await vi.importActual('../lib/reactDebuggingRunner');
  return {
    ...actual,
    runReactDebuggingPreview: (...args: any[]) => runPreview(...args),
    runReactDebuggingTests: (...args: any[]) => runTests(...args),
    submitReactDebuggingSolution: (...args: any[]) => submitSolution(...args)
  };
});

describe('ReactDebugging detail', () => {
  it('switches files, runs tests, and unlocks review on submit', async () => {
    render(
      <MemoryRouter initialEntries={['/react-debugging/react-debug-profile-switch-refresh']}>
        <Routes>
          <Route path="/react-debugging/:id" element={<ReactDebuggingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    fireEvent.click(await screen.findByRole('button', { name: 'components/ProfilePanel.tsx' }));
    expect(screen.getByDisplayValue(/React.useEffect/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    expect(await screen.findByText('Failed')).toBeInTheDocument();
    expect(runTests).toHaveBeenCalledWith(
      expect.objectContaining({
        edits: {}
      })
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Root cause')).toBeInTheDocument();
    expect(screen.getByText('Effects should list every reactive value they read from the component scope.')).toBeInTheDocument();
    expect(submitSolution).toHaveBeenCalledWith(
      expect.objectContaining({
        edits: {}
      })
    );
  });
});
