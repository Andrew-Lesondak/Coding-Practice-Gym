import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReactDebuggingCatalog from '../pages/ReactDebuggingCatalog';

describe('ReactDebugging catalog', () => {
  it('filters by bug type', () => {
    render(
      <MemoryRouter>
        <ReactDebuggingCatalog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('bug type'), { target: { value: 'race condition' } });

    expect(screen.getByText('Search Results Show the Wrong Query')).toBeInTheDocument();
    expect(screen.queryByText('Timer Freezes or Counts Incorrectly')).not.toBeInTheDocument();
  });
});
