import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DSADrillDetail from '../pages/DSADrillDetail';

describe('DSA drill timer UI', () => {
  it('renders timer', () => {
    render(
      <MemoryRouter initialEntries={["/dsa/drills/core-loop-two-sum"]}>
        <Routes>
          <Route path="/dsa/drills/:id" element={<DSADrillDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Time remaining')).toBeInTheDocument();
  });
});
