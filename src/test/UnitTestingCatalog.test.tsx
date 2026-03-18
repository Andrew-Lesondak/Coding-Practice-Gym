import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UnitTestingCatalog from '../pages/UnitTestingCatalog';

describe('UnitTesting catalog', () => {
  it('filters by framework', () => {
    render(
      <MemoryRouter>
        <UnitTestingCatalog />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('framework'), {
      target: { value: 'vitest-testing-library' }
    });

    expect(screen.queryByText('Test slugify')).toBeNull();
    expect(screen.getByText('Test CounterButton')).toBeInTheDocument();
  });
});
