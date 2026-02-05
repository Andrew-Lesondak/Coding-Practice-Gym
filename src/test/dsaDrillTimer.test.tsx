import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import DSADrillDetail from '../pages/DSADrillDetail';

vi.useFakeTimers();

describe('DSA drill timer', () => {
  it('moves to review on timeout', () => {
    render(
      <MemoryRouter initialEntries={["/dsa/drills/pattern-two-sum"]}>
        <Routes>
          <Route path="/dsa/drills/:id" element={<DSADrillDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByLabelText('Pattern(s)');
    fireEvent.change(input, { target: { value: 'Hashing' } });
    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000);
    });
    expect(screen.getByText('Reference snippet')).toBeInTheDocument();
  });

  afterAll(() => {
    vi.useRealTimers();
  });
});
