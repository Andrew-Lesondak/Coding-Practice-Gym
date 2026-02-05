import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AdaptiveSession from '../pages/AdaptiveSession';
import { saveAdaptivePlan } from '../lib/adaptiveStorage';
import { AdaptiveSessionPlan } from '../types/adaptive';
import { useAppStore } from '../store/useAppStore';

const createPlan = (): AdaptiveSessionPlan => ({
  id: 'adaptive-test',
  createdAt: Date.now(),
  mode: 'dsa',
  lengthMinutes: 15,
  intensity: 'interview',
  seed: 1,
  summary: { primaryFocus: [], dueReviewCount: 0, estimatedTotalMinutes: 2 },
  blocks: [
    {
      id: 'block-1',
      blockType: 'dsa_review',
      title: 'Two Sum',
      targetId: 'two-sum',
      minutes: 0,
      timed: true,
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
});

const renderSession = () => {
  return render(
    <MemoryRouter initialEntries={['/adaptive/session/adaptive-test']}>
      <Routes>
        <Route path="/adaptive/session/:sessionId" element={<AdaptiveSession />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AdaptiveSession', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
    saveAdaptivePlan(createPlan());
  });

  it('advances to next block after timed block timeout', () => {
    vi.useFakeTimers();
    renderSession();
    fireEvent.click(screen.getByText('Start block'));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Reflection')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renders session summary after completion', () => {
    vi.useFakeTimers();
    renderSession();
    fireEvent.click(screen.getByText('Start block'));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByText('Finish session'));
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
