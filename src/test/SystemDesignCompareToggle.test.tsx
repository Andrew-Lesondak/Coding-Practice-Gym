import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SystemDesignDetail from '../pages/SystemDesignDetail';
import { useAppStore } from '../store/useAppStore';

describe('SystemDesign compare toggle', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('toggles diff mode', () => {
    render(
      <MemoryRouter initialEntries={["/system-design/url-shortener"]}>
        <Routes>
          <Route path="/system-design/:id" element={<SystemDesignDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
