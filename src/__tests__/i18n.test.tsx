import { render, screen, fireEvent } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import '../i18n';

const router = createMemoryRouter([
  { path: '/', element: <AppLayout />, children: [{ index: true, element: <HomePage /> }] }
]);

describe('i18n', () => {
  it('switches language to Persian and sets RTL dir', () => {
    render(<RouterProvider router={router} />);
    const select = screen.getByLabelText(/Language|زبان/i);
    fireEvent.change(select, { target: { value: 'fa' } });
    expect(screen.getByRole('link', { name: /خانه/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });
});
