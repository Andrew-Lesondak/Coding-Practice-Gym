import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import SystemDesignDrillDetail from '../pages/SystemDesignDrillDetail';
import { useAppStore } from '../store/useAppStore';

describe('drill review screen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders rubric and reference notes in review', () => {
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

    expect(screen.getByText('Rubric')).toBeInTheDocument();
    expect(screen.getByText('Reference notes')).toBeInTheDocument();
  });
});
