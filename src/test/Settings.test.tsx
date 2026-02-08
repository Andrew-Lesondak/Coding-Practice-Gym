import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../pages/Settings';
import { useAppStore } from '../store/useAppStore';

describe('Settings page', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {},
      quizzes: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false }
    });
  });

  it('toggles step lock', () => {
    render(<MemoryRouter><Settings /></MemoryRouter>);
    const button = screen.getByRole('button', { name: 'Enabled' });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument();
  });
});
