import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SystemDesignMockSession from '../pages/SystemDesignMockSession';
import { saveMockSession } from '../lib/mockInterviewStorage';

const session = {
  id: 'mock-review',
  promptId: 'url-shortener',
  drills: { requirementsDrillId: 'req-url-shortener', apiDrillId: 'api-notifications', scalingDrillId: 'data-news-feed' },
  phaseIndex: 4,
  phaseStartedAt: null,
  phaseTimeRemainingSeconds: 0,
  responses: { drillResponses: {}, fullDesignResponse: null },
  scores: { drillScores: {}, fullDesignScore: 0 },
  completedAt: Date.now(),
  reflection: { wentWell: 'Good', change: 'Improve', weakestPhase: 'API' }
};

describe('mock interview review', () => {
  it('renders review screen', () => {
    saveMockSession(session as any);
    render(
      <MemoryRouter initialEntries={[`/system-design/mock/${session.id}`]}>
        <Routes>
          <Route path="/system-design/mock/:sessionId" element={<SystemDesignMockSession />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Mock Interview Review')).toBeInTheDocument();
  });
});
