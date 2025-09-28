import { render, screen, fireEvent } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as moviesService from '@/services/movies';
import '../i18n';

const router = createMemoryRouter([
  { path: '/', element: <AppLayout />, children: [{ index: true, element: <HomePage /> }] }
]);

describe('i18n', () => {
  it('switches language to Persian and sets RTL dir', () => {
    vi.spyOn(moviesService, 'fetchCategory').mockResolvedValue({ page: 1, totalPages: 1, results: [] } as any);
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    const select = screen.getByLabelText(/Language|زبان/i);
    fireEvent.change(select, { target: { value: 'fa' } });
    expect(screen.getByRole('link', { name: /خانه/i })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });
});
