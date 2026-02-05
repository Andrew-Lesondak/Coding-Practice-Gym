import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SystemDesignDetail from '../pages/SystemDesignDetail';
import { useAppStore } from '../store/useAppStore';

describe('SystemDesign review flow', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: {
        problems: {},
        systemDesign: {
          'url-shortener': {
            attempts: 1,
            passes: 1,
            stepCompletion: {},
            rubricChecks: {},
            reviewIntervalDays: 2,
            easeFactor: 2.3,
            explanation: {
              tradeoff: 'Read latency vs cost',
              risk: 'Cache stampede, add TTL jitter',
              scaleChange: 'Shard by hash',
              updatedAt: new Date().toISOString()
            },
            explanationHistory: [
              {
                tradeoff: 'Old tradeoff',
                risk: 'Old risk',
                scaleChange: 'Old scale',
                updatedAt: new Date().toISOString()
              }
            ]
          }
        }
      },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('shows compare toggle with previous explanation', () => {
    render(
      <MemoryRouter initialEntries={["/system-design/url-shortener"]}>
        <Routes>
          <Route path="/system-design/:id" element={<SystemDesignDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByText('Compare my last explanation')).toBeInTheDocument();
  });
});
