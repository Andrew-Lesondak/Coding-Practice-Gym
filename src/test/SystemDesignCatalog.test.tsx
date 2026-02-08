import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SystemDesignCatalog from '../pages/SystemDesignCatalog';
import { useAppStore } from '../store/useAppStore';

describe('SystemDesignCatalog', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {},
      quizzes: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('filters by difficulty', () => {
    render(
      <MemoryRouter>
        <SystemDesignCatalog />
      </MemoryRouter>
    );

    expect(screen.getByText('URL Shortener')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'hard' }));
    expect(screen.queryByText('URL Shortener')).toBeNull();
  });
});
