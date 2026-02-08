import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Catalog from '../pages/Catalog';
import { useAppStore } from '../store/useAppStore';

describe('Catalog page', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false }
    });
  });

  it('filters by difficulty', () => {
    render(
      <MemoryRouter>
        <Catalog />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Two Sum|Valid Palindrome/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Hard' }));
    expect(screen.queryByText('Two Sum')).toBeNull();
  });
});
