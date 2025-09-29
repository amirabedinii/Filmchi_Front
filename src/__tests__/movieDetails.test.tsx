import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import MovieDetailsPage from '@/pages/MovieDetailsPage';
import '@testing-library/jest-dom';

// Mock the services
vi.mock('@/services/movies', () => ({
  fetchMovieDetails: vi.fn(),
  fetchSimilarMovies: vi.fn(),
  fetchBookmarkStatus: vi.fn(),
  bookmarkMovie: vi.fn(),
  unbookmarkMovie: vi.fn(),
  rateMovie: vi.fn(),
}));

// Mock the auth store
vi.mock('@/stores/useAuthStore');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

const mockMovie = {
  id: 603,
  title: 'The Matrix',
  overview: 'A computer programmer is led to fight an underground war against powerful computers.',
  posterPath: '/f89q3dFQbQ5XxHh4XJeH2hFgLD0.jpg',
  backdropPath: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
  releaseDate: '1999-03-30',
  voteAverage: 8.2,
  runtime: 136,
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' },
  ],
  credits: {
    cast: [
      {
        id: 6384,
        name: 'Keanu Reeves',
        character: 'Neo',
        profilePath: '/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg',
      },
    ],
    crew: [
      {
        id: 905,
        name: 'Lana Wachowski',
        job: 'Director',
        department: 'Directing',
        profilePath: '/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg',
      },
    ],
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/movies/603']}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('MovieDetailsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock auth store default state
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      setTokens: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
  });

  it('shows loading state initially', () => {
    const { fetchMovieDetails } = require('@/services/movies');
    fetchMovieDetails.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-skeleton') || screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it('displays movie details when loaded', async () => {
    const { fetchMovieDetails, fetchSimilarMovies } = require('@/services/movies');
    fetchMovieDetails.mockResolvedValue(mockMovie);
    fetchSimilarMovies.mockResolvedValue({ results: [] });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText(mockMovie.overview)).toBeInTheDocument();
    expect(screen.getByText('1999')).toBeInTheDocument();
    expect(screen.getByText('8.2/10')).toBeInTheDocument();
  });

  it('shows bookmark button for authenticated users', async () => {
    // Mock authenticated state
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
      tokens: { accessToken: 'token', refreshToken: 'refresh' },
      setTokens: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    const { fetchMovieDetails, fetchSimilarMovies, fetchBookmarkStatus } = require('@/services/movies');
    fetchMovieDetails.mockResolvedValue(mockMovie);
    fetchSimilarMovies.mockResolvedValue({ results: [] });
    fetchBookmarkStatus.mockResolvedValue({ isBookmarked: false });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.bookmark')).toBeInTheDocument();
    expect(screen.getByText('movie.rate_movie:')).toBeInTheDocument();
  });

  it('displays cast members', async () => {
    const { fetchMovieDetails, fetchSimilarMovies } = require('@/services/movies');
    fetchMovieDetails.mockResolvedValue(mockMovie);
    fetchSimilarMovies.mockResolvedValue({ results: [] });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.cast')).toBeInTheDocument();
    expect(screen.getByText('Keanu Reeves')).toBeInTheDocument();
    expect(screen.getByText('Neo')).toBeInTheDocument();
  });

  it('displays director information', async () => {
    const { fetchMovieDetails, fetchSimilarMovies } = require('@/services/movies');
    fetchMovieDetails.mockResolvedValue(mockMovie);
    fetchSimilarMovies.mockResolvedValue({ results: [] });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.director:')).toBeInTheDocument();
    expect(screen.getByText('Lana Wachowski')).toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    const { fetchMovieDetails } = require('@/services/movies');
    fetchMovieDetails.mockRejectedValue(new Error('Failed to fetch'));

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('movie.error')).toBeInTheDocument();
    });

    expect(screen.getByText('app.home')).toBeInTheDocument();
  });

  it('shows similar movies when available', async () => {
    const similarMovies = {
      results: [
        {
          id: 604,
          title: 'The Matrix Reloaded',
          posterPath: '/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg',
          releaseDate: '2003-05-15',
          voteAverage: 7.2,
        },
      ],
    };

    const { fetchMovieDetails, fetchSimilarMovies } = require('@/services/movies');
    fetchMovieDetails.mockResolvedValue(mockMovie);
    fetchSimilarMovies.mockResolvedValue(similarMovies);

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.similar')).toBeInTheDocument();
    expect(screen.getByText('The Matrix Reloaded')).toBeInTheDocument();
  });
});
