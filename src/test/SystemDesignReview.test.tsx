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
        },
        systemDesignDrills: {},
        quizzes: {},
        reactCoding: {},
        reactDebugging: {}
      },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('shows compare section and allows add to my design', () => {
    render(
      <MemoryRouter initialEntries={["/system-design/url-shortener"]}>
        <Routes>
          <Route path="/system-design/:id" element={<SystemDesignDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByText('Compare to reference')).toBeInTheDocument();
    expect(screen.getByText('Compare my last explanation')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Add to my design' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Practice' }));
    const textareas = screen.getAllByRole('textbox');
    const hasDecision = textareas.some((el) => (el as HTMLTextAreaElement).value.includes('Decision:'));
    expect(hasDecision).toBe(true);
  });
});
