import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import '../i18n';

describe('Navbar', () => {
  it('renders brand and nav links', () => {
    const router = createMemoryRouter([
      { path: '/', element: <AppLayout />, children: [{ index: true, element: <HomePage /> }] }
    ]);
    render(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: /Filmchi|فیل.?مچی/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home|خانه/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login|ورود/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register|ثبت‌نام/i })).toBeInTheDocument();
  });
});


