import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import SystemDesignMockSession from '../pages/SystemDesignMockSession';
import { createMockSession } from '../lib/mockInterview';
import { saveMockSession } from '../lib/mockInterviewStorage';
import { systemDesignDrills } from '../data/systemDesignDrills';

describe('mock interview timer', () => {
  it('locks editor on timeout', () => {
    vi.useFakeTimers();
    const session = createMockSession('url-shortener', systemDesignDrills, 'easy');
    saveMockSession(session);

    render(
      <MemoryRouter initialEntries={[`/system-design/mock/${session.id}`]}>
        <Routes>
          <Route path="/system-design/mock/:sessionId" element={<SystemDesignMockSession />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start phase' }));
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(screen.getByRole('button', { name: 'End phase early' })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
