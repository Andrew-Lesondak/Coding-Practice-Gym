import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../pages/Settings';
import { useAppStore } from '../store/useAppStore';

describe('Settings page', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true }
    });
  });

  it('toggles step lock', () => {
    render(<Settings />);
    const button = screen.getByRole('button', { name: 'Enabled' });
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeInTheDocument();
  });
});
