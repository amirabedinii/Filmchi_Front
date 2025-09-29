import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import MovieCategoryPage from '../pages/MovieCategoryPage';
import * as moviesService from '../services/movies';

// Mock the movies service
vi.mock('../services/movies', () => ({
  fetchCategory: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ category: 'trending' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe('MovieCategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category page with correct title', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 10,
      results: [
        {
          id: 1,
          title: 'Test Movie',
          posterPath: '/test.jpg',
          releaseDate: '2023-01-01',
          voteAverage: 8.5,
        },
      ],
    };

    vi.mocked(moviesService.fetchCategory).mockResolvedValue(mockMovies);

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    expect(screen.getByText('Browse all Trending movies')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    vi.mocked(moviesService.fetchCategory).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<MovieCategoryPage />);

    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', async () => {
    vi.mocked(moviesService.fetchCategory).mockRejectedValue(new Error('API Error'));

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Error loading movies')).toHaveLength(2); // Two error messages
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('displays movies in grid layout', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 10,
      results: [
        {
          id: 1,
          title: 'Test Movie 1',
          posterPath: '/test1.jpg',
          releaseDate: '2023-01-01',
          voteAverage: 8.5,
        },
        {
          id: 2,
          title: 'Test Movie 2',
          posterPath: '/test2.jpg',
          releaseDate: '2023-02-01',
          voteAverage: 7.5,
        },
      ],
    };

    vi.mocked(moviesService.fetchCategory).mockResolvedValue(mockMovies);

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  it('shows filters when filter button is clicked', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 10,
      results: [],
    };

    vi.mocked(moviesService.fetchCategory).mockResolvedValue(mockMovies);

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Filters'));

    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Genre')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 10,
      results: [],
    };

    vi.mocked(moviesService.fetchCategory).mockResolvedValue(mockMovies);

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays no movies message when no results', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 1,
      results: [],
    };

    vi.mocked(moviesService.fetchCategory).mockResolvedValue(mockMovies);

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('No movies found')).toBeInTheDocument();
    });
  });

  it('shows load more button when there are more pages', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 3,
      results: [
        {
          id: 1,
          title: 'Test Movie',
          posterPath: '/test.jpg',
          releaseDate: '2023-01-01',
          voteAverage: 8.5,
        },
      ],
    };

    vi.mocked(moviesService.fetchCategory).mockResolvedValue(mockMovies);

    renderWithProviders(<MovieCategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Load more')).toBeInTheDocument();
    });
  });
});

