import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import SystemDesignDrillDetail from '../pages/SystemDesignDrillDetail';
import { useAppStore } from '../store/useAppStore';

describe('drill timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {}, reactDebugging: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('locks editor on timeout', () => {
    render(
      <MemoryRouter initialEntries={["/system-design/drills/req-url-shortener"]}>
        <Routes>
          <Route path="/system-design/drills/:id" element={<SystemDesignDrillDetail />} />
        </Routes>
      </MemoryRouter>
    );

    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'typing' } });

    act(() => {
      vi.advanceTimersByTime(6 * 60 * 1000);
    });

    const reviewHeading = screen.getByText('Your response');
    expect(reviewHeading).toBeInTheDocument();
  });
});
