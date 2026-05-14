import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DataStructuresCatalog from '../pages/DataStructuresCatalog';

describe('Data Structures catalog', () => {
  it('filters by operation', () => {
    render(
      <MemoryRouter>
        <DataStructuresCatalog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('operations'), {
      target: { value: 'getMin' }
    });

    expect(screen.getByText('Implement MinStack')).toBeInTheDocument();
    expect(screen.queryByText('Implement Queue')).toBeNull();
  });
});
