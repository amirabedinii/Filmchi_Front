import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MovieDetailsPage from '@/pages/MovieDetailsPage';
import { vi } from 'vitest';
import * as moviesService from '@/services/movies';

// Mock movie services
vi.mock('@/services/movies', () => ({
  fetchMovieDetails: vi.fn(),
  fetchSimilarMovies: vi.fn(),
  fetchBookmarkStatus: vi.fn(),
}));

// Mock stores
vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { isAuthenticated: false, user: null };
    return selector(state);
  },
}));

vi.mock('@/stores/useUiStore', () => ({
  useUiStore: (selector: any) => {
    const state = { language: 'en', theme: 'light' };
    return selector(state);
  },
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Star: () => <div>Star</div>,
  Bookmark: () => <div>Bookmark</div>,
  BookmarkCheck: () => <div>BookmarkCheck</div>,
  Calendar: () => <div>Calendar</div>,
  Clock: () => <div>Clock</div>,
  DollarSign: () => <div>DollarSign</div>,
  ArrowLeft: () => <div>ArrowLeft</div>,
  Search: () => <div>Search</div>,
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <I18nextProvider i18n={i18n}>
        {ui}
      </I18nextProvider>
    </QueryClientProvider>
  );
}

describe('Routing', () => {
  it('renders Home at /', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: /Filmchi|فیل.?مچی/i })).toBeInTheDocument();
  });

  it('renders Login at /login', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/login'] });
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: /Login|ورود/i })).toBeInTheDocument();
  });

  it('renders Register at /register', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/register'] });
    renderWithProviders(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: /Register|ثبت‌نام/i })).toBeInTheDocument();
  });

  it('renders Movie Details at /movies/1', async () => {
    // Mock movie details response
    const mockMovie = {
      id: 1,
      title: 'Test Movie',
      overview: 'Test overview',
      posterPath: '/poster.jpg',
      releaseDate: '2024-01-01',
      voteAverage: 8.5,
    };
    
    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovie as any);
    vi.mocked(moviesService.fetchSimilarMovies).mockResolvedValue({
      page: 1,
      totalPages: 1,
      results: [],
    });
    vi.mocked(moviesService.fetchBookmarkStatus).mockResolvedValue({ isBookmarked: false });

    const router = createMemoryRouter(routes, { initialEntries: ['/movies/1'] });
    renderWithProviders(<RouterProvider router={router} />);
    
    // Wait for the movie to load
    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
