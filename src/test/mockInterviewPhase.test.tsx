import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SystemDesignMockSession from '../pages/SystemDesignMockSession';
import { createMockSession } from '../lib/mockInterview';
import { saveMockSession } from '../lib/mockInterviewStorage';
import { systemDesignDrills } from '../data/systemDesignDrills';

describe('mock interview phase transitions', () => {
  it('advances to next phase on end', () => {
    const session = createMockSession('url-shortener', systemDesignDrills, 'easy');
    saveMockSession(session);

    render(
      <MemoryRouter initialEntries={[`/system-design/mock/${session.id}`]}>
        <Routes>
          <Route path="/system-design/mock/:sessionId" element={<SystemDesignMockSession />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'End phase early' }));
    expect(screen.getByText(/Phase 2/)).toBeInTheDocument();
  });
});
