import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReactCodingCatalog from '../pages/ReactCodingCatalog';

describe('ReactCoding catalog', () => {
  it('filters by topic', () => {
    render(
      <MemoryRouter>
        <ReactCodingCatalog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('topic'), { target: { value: 'useReducer' } });

    expect(screen.getByText('Counter with useReducer')).toBeInTheDocument();
    expect(screen.queryByText('usePrevious Hook')).not.toBeInTheDocument();
  });
});
