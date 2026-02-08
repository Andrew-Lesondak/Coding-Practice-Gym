import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdaptiveSession from '../pages/AdaptiveSession';
import { AdaptiveSessionPlan } from '../types/adaptive';
import { useAppStore } from '../store/useAppStore';

const plan: AdaptiveSessionPlan = {
  id: 'adaptive-test',
  createdAt: Date.now(),
  mode: 'dsa',
  lengthMinutes: 15,
  intensity: 'chill',
  seed: 1,
  summary: { primaryFocus: [], dueReviewCount: 0, estimatedTotalMinutes: 2 },
  blocks: [
    {
      id: 'block-1',
      blockType: 'dsa_review',
      title: 'Two Sum',
      targetId: 'two-sum',
      minutes: 1,
      timed: false,
      rationale: 'test',
      signals: {},
      userEditable: true
    },
    {
      id: 'block-2',
      blockType: 'reflection',
      title: 'Reflection',
      targetId: 'none',
      minutes: 1,
      timed: false,
      rationale: 'test',
      signals: {},
      userEditable: false
    }
  ]
};

vi.mock('react-router-dom', () => ({
  useParams: () => ({ sessionId: 'adaptive-test' }),
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>
}));

vi.mock('../lib/adaptiveStorage', () => ({
  getAdaptivePlan: () => plan,
  saveAdaptiveRun: () => {},
  loadAdaptiveRuns: () => []
}));

describe('AdaptiveSession', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {},
      quizzes: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('advances to next block after review completion', () => {
    render(<AdaptiveSession />);
    fireEvent.click(screen.getByText('Mark review complete'));
    expect(screen.getByText('Block 2 of 2')).toBeInTheDocument();
  });

  it('renders session summary after completion', () => {
    render(<AdaptiveSession />);
    fireEvent.click(screen.getByText('Mark review complete'));
    fireEvent.click(screen.getByText('Finish session'));
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
  });
});
