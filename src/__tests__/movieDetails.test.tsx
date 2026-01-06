import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import MovieDetailsPage from '@/pages/MovieDetailsPage';
import * as moviesService from '@/services/movies';
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

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '603' }), // Mock the movie ID
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Star: () => <div>Star</div>,
  Bookmark: () => <div>Bookmark</div>,
  BookmarkCheck: () => <div>BookmarkCheck</div>,
  Calendar: () => <div>Calendar</div>,
  Clock: () => <div>Clock</div>,
  DollarSign: () => <div>DollarSign</div>,
  ArrowLeft: () => <div>ArrowLeft</div>,
}));

// Mock useUiStore
vi.mock('@/stores/useUiStore', () => ({
  useUiStore: (selector: any) => {
    const state = { language: 'en', theme: 'light' };
    return selector(state);
  },
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
    vi.mocked(moviesService.fetchMovieDetails).mockImplementation(() => new Promise(() => { })); // Never resolves

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    // Check for loading skeleton (animate-pulse class) or loading text
    const skeleton = document.querySelector('.animate-pulse');
    const loadingText = screen.queryByText(/Loading/i);
    expect(skeleton || loadingText).toBeTruthy();
  });

  it('displays movie details when loaded', async () => {
    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovie);
    vi.mocked(moviesService.fetchSimilarMovies).mockResolvedValue({ results: [], page: 1, totalPages: 1 });

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

    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovie);
    vi.mocked(moviesService.fetchSimilarMovies).mockResolvedValue({ results: [], page: 1, totalPages: 1 });
    vi.mocked(moviesService.fetchBookmarkStatus).mockResolvedValue({ isBookmarked: false });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.bookmark')).toBeInTheDocument();
    expect(screen.getByText('movie.rate_movie:')).toBeInTheDocument();
  });

  it('displays cast members', async () => {
    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovie);
    vi.mocked(moviesService.fetchSimilarMovies).mockResolvedValue({ results: [], page: 1, totalPages: 1 });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.cast')).toBeInTheDocument();
    expect(screen.getByText('Keanu Reeves')).toBeInTheDocument();
    expect(screen.getByText('Neo')).toBeInTheDocument();
  });

  it('displays director information', async () => {
    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovie);
    vi.mocked(moviesService.fetchSimilarMovies).mockResolvedValue({ results: [], page: 1, totalPages: 1 });

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    expect(screen.getByText('movie.director:')).toBeInTheDocument();
    expect(screen.getByText('Lana Wachowski')).toBeInTheDocument();
  });

  it('handles error state gracefully', async () => {
    vi.mocked(moviesService.fetchMovieDetails).mockRejectedValue(new Error('Failed to fetch'));

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('movie.error')).toBeInTheDocument();
    });

    expect(screen.getByText('app.home')).toBeInTheDocument();
  });

  it('shows similar movies when available', async () => {
    const similarMovies = {
      page: 1,
      totalPages: 1,
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

    vi.mocked(moviesService.fetchMovieDetails).mockResolvedValue(mockMovie);
    vi.mocked(moviesService.fetchSimilarMovies).mockResolvedValue(similarMovies);

    render(<MovieDetailsPage />, { wrapper: createWrapper() });

    // Wait for both movie and similar movies to load
    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('movie.similar')).toBeInTheDocument();
      expect(screen.getByText('The Matrix Reloaded')).toBeInTheDocument();
    });
  });
});
