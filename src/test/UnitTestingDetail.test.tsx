import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import UnitTestingDetail from '../pages/UnitTestingDetail';

const runTests = vi.fn().mockResolvedValue({
  ok: false,
  errorType: 'WEAK_TEST_FAILURE',
  error: 'missed mutants',
  results: [{ name: 'visible', passed: true }],
  logs: [],
  weakMutants: [{ id: 'mutant-1' }]
});

const submitSolution = vi.fn().mockResolvedValue({
  ok: true,
  results: [{ name: 'submit', passed: true }],
  logs: []
});

vi.mock('../lib/unitTestingRunner', async () => {
  const actual = await vi.importActual('../lib/unitTestingRunner');
  return {
    ...actual,
    runUnitTestingTests: (...args: any[]) => runTests(...args),
    submitUnitTestingSolution: (...args: any[]) => submitSolution(...args)
  };
});

describe('UnitTesting detail', () => {
  it('shows weak test feedback and review reference tests', async () => {
    render(
      <MemoryRouter initialEntries={['/unit-testing/unit-testing-sum-positive-numbers']}>
        <Routes>
          <Route path="/unit-testing/:id" element={<UnitTestingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    expect(await screen.findByText(/missed mutants/i)).toBeInTheDocument();
    expect(screen.getByText(/hidden mutants still survived/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review' }));
    expect(await screen.findByText('Reference test file')).toBeInTheDocument();
    expect(screen.getByDisplayValue(/returns the sum for a simple positive array/)).toBeInTheDocument();
  });
});
