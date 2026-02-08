import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import { useAppStore } from '../store/useAppStore';
import { vi } from 'vitest';

vi.mock('../lib/dsaDrillStorage', () => ({ loadDrillAttempts: () => [] }));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('renders not enough data states', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getAllByText(/Not enough data yet/).length).toBeGreaterThan(0);
  });
});
