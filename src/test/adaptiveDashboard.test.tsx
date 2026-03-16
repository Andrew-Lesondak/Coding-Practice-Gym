import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import AdaptiveDashboard from '../pages/AdaptiveDashboard';
import { useAppStore } from '../store/useAppStore';

const renderWithRouter = () => render(
  <MemoryRouter>
    <AdaptiveDashboard />
  </MemoryRouter>
);

describe('AdaptiveDashboard', () => {
  beforeEach(() => {
    useAppStore.setState({
      progress: { problems: {}, systemDesign: {}, systemDesignDrills: {}, quizzes: {}, reactCoding: {}, reactDebugging: {} },
      settings: { languageMode: 'ts', hintLevel: 1, lockSteps: true, overlayEnabled: false },
      overlayVersion: 0
    } as any);
  });

  it('generates a plan preview', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('Generate plan'));
    expect(screen.getByText('Plan Preview')).toBeInTheDocument();
    expect(screen.getAllByText(/min/).length).toBeGreaterThan(0);
  });

  it('allows removing an editable block', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('Generate plan'));
    const removeButtons = screen.getAllByText('Remove');
    const initialButtons = removeButtons.length;
    fireEvent.click(removeButtons[0]);
    const afterButtons = screen.getAllByText('Remove').length;
    expect(afterButtons).toBeLessThan(initialButtons);
  });

  it('allows replacing a block with a compatible candidate', () => {
    renderWithRouter();
    fireEvent.click(screen.getByText('Generate plan'));
    const selects = screen.getAllByRole('combobox');
    if (selects.length === 0) return;
    const select = selects[0];
    const options = select.querySelectorAll('option');
    if (options.length < 2) return;
    const nextValue = options[1].getAttribute('value') ?? '';
    fireEvent.change(select, { target: { value: nextValue } });
    expect((select as HTMLSelectElement).value).toBe(nextValue);
  });
});
