import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SystemDesignMockDashboard from '../pages/SystemDesignMockDashboard';
import { vi } from 'vitest';

const mockSession = {
  id: 'session-1',
  promptId: 'url-shortener',
  drills: { requirementsDrillId: 'req-url-shortener', apiDrillId: 'api-notifications', scalingDrillId: 'data-news-feed' },
  phaseIndex: 0,
  phaseStartedAt: null,
  phaseTimeRemainingSeconds: 300,
  responses: { drillResponses: {}, fullDesignResponse: null },
  scores: { drillScores: {}, fullDesignScore: 0 }
};

vi.mock('../lib/mockInterviewStorage', async () => {
  return {
    loadMockSessions: () => [mockSession],
    saveMockSession: () => {}
  };
});

describe('mock interview dashboard', () => {
  it('renders last session', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/system-design/mock" element={<SystemDesignMockDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Last mock interview')).toBeInTheDocument();
  });
});
