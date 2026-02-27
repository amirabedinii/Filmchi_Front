import { render, screen, fireEvent } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as moviesService from '@/services/movies';
import '../i18n';

describe('Navbar', () => {
  it('renders brand and nav links', () => {
    vi.spyOn(moviesService, 'fetchCategory').mockResolvedValue({ page: 1, totalPages: 1, results: [] } as any);
    const qc = new QueryClient();
    const router = createMemoryRouter([
      { path: '/', element: <AppLayout />, children: [{ index: true, element: <HomePage /> }] }
    ]);
    render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    expect(screen.getByRole('link', { name: /Filmchi|فیل.?مچی/i })).toBeInTheDocument();
    // Hamburger menu (mobile): open it and ensure nav links exist (may also exist in desktop nav)
    const menuButton = screen.getByRole('button', { name: /menu|منو/i });
    expect(menuButton).toBeInTheDocument();
    fireEvent.click(menuButton);
    expect(screen.getAllByRole('link', { name: /home|خانه/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /login|ورود/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /register|ثبت‌نام/i }).length).toBeGreaterThanOrEqual(1);
  });
});


