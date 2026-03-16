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

    expect(screen.getByText('Older Search Results Replace Newer Ones')).toBeInTheDocument();
    expect(screen.queryByText('Auto Counter Freezes at 1')).not.toBeInTheDocument();
  });
});
