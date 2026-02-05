import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import DSADrillDetail from '../pages/DSADrillDetail';

vi.useFakeTimers();

describe('DSA drill review', () => {
  it('renders reference snippet', () => {
    render(
      <MemoryRouter initialEntries={["/dsa/drills/core-loop-two-sum"]}>
        <Routes>
          <Route path="/dsa/drills/:id" element={<DSADrillDetail />} />
        </Routes>
      </MemoryRouter>
    );

    act(() => {
      vi.advanceTimersByTime(6 * 60 * 1000);
    });

    expect(screen.getByText('Reference snippet')).toBeInTheDocument();
  });

  afterAll(() => {
    vi.useRealTimers();
  });
});
