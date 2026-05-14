import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import DataStructuresDetail from '../pages/DataStructuresDetail';

const runTests = vi.fn().mockResolvedValue({
  ok: true,
  results: [{ name: 'visible test', passed: true }],
  logs: []
});

const submitSolution = vi.fn().mockResolvedValue({
  ok: true,
  results: [{ name: 'visible test', passed: true }, { name: 'hidden test', passed: true }],
  logs: []
});

vi.mock('../lib/dataStructureRunner', async () => {
  const actual = await vi.importActual('../lib/dataStructureRunner');
  return {
    ...actual,
    runDataStructureTests: (...args: any[]) => runTests(...args),
    submitDataStructureSolution: (...args: any[]) => submitSolution(...args)
  };
});

describe('Data Structures detail', () => {
  it('runs visible tests and shows review invariants and complexity', async () => {
    render(
      <MemoryRouter initialEntries={['/data-structures/data-structure-stack']}>
        <Routes>
          <Route path="/data-structures/:id" element={<DataStructuresDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Implement' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run tests' }));
    expect(await screen.findByText('visible test')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review' }));
    expect(await screen.findByText('Complexity table')).toBeInTheDocument();
    expect(screen.getByText('Invariants')).toBeInTheDocument();
    expect(screen.getByText(/push: O\(1\)/i)).toBeInTheDocument();
  });
});
