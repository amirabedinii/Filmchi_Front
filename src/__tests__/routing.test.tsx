import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MovieDetailsPage from '@/pages/MovieDetailsPage';
import '../i18n';

const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'movies/:id', element: <MovieDetailsPage /> }
    ]
  }
];

describe('Routing', () => {
  it('renders Home at /', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /Filmchi|فیل.?مچی/i })).toBeInTheDocument();
  });

  it('renders Login at /login', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/login'] });
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /Login|ورود/i })).toBeInTheDocument();
  });

  it('renders Register at /register', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/register'] });
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /Register|ثبت‌نام/i })).toBeInTheDocument();
  });

  it('renders Movie Details at /movies/1', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/movies/1'] });
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /Movie Details/i })).toBeInTheDocument();
  });
});
