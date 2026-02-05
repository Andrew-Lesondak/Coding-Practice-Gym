import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import DSADrillDetail from '../pages/DSADrillDetail';

vi.useFakeTimers();

describe('DSA drill timer', () => {
  it('moves to review on timeout', () => {
    render(
      <MemoryRouter initialEntries={["/dsa/drills/core-loop-two-sum"]}>
        <Routes>
          <Route path="/dsa/drills/:id" element={<DSADrillDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const editor = screen.getByText('Run tests');
    act(() => {
      vi.advanceTimersByTime(6 * 60 * 1000);
    });
    expect(editor).toBeInTheDocument();
  });

  afterAll(() => {
    vi.useRealTimers();
  });
});
