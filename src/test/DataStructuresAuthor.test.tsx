import { fireEvent, render, screen } from '@testing-library/react';
import Author from '../pages/Author';

describe('Data Structures authoring', () => {
  it('shows validation errors for invalid guided stubs', async () => {
    render(<Author />);

    fireEvent.click(screen.getByRole('button', { name: 'Data Structures' }));
    fireEvent.change(screen.getByLabelText('Guided stub (TS)'), {
      target: { value: 'export class Stack<T> {}' }
    });

    expect(await screen.findByText(/No step headers found/i)).toBeInTheDocument();
  });
});
