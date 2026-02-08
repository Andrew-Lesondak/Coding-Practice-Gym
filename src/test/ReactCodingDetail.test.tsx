import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import ReactCodingDetail from '../pages/ReactCodingDetail';

const runReactTests = vi.fn().mockResolvedValue({
  ok: true,
  results: [{ name: 'test', passed: true }],
  logs: []
});

vi.mock('../lib/reactRunner', () => ({
  runReactTests: (...args: any[]) => runReactTests(...args)
}));

describe('ReactCoding detail', () => {
  it('runs tests and shows results', async () => {
    render(
      <MemoryRouter initialEntries={['/react/react-counter-reducer']}>
        <Routes>
          <Route path="/react/:id" element={<ReactCodingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    fireEvent.click(screen.getByRole('button', { name: /Run tests/i }));
    expect(await screen.findByText('Passed')).toBeInTheDocument();
  });
});
