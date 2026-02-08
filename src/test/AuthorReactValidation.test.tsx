import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Author from '../pages/Author';

describe('React coding authoring', () => {
  it('prevents saving when required fields are missing', () => {
    render(
      <MemoryRouter>
        <Author />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('React Coding'));
    const saveButton = screen.getByRole('button', { name: /save to local problem pack/i });
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Fix validation errors before saving.')).toBeInTheDocument();
  });
});
