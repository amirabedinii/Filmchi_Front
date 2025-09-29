import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import HomePage from '../pages/HomePage';
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

describe('HomePage Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders View All buttons for each category', async () => {
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

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getAllByText('View All')).toHaveLength(5); // 5 categories
    });
  });

  it('navigates to category page when View All is clicked', async () => {
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

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getAllByText('View All')).toHaveLength(5);
    });

    const viewAllButtons = screen.getAllByText('View All');
    fireEvent.click(viewAllButtons[0]); // Click first View All button (trending)

    expect(mockNavigate).toHaveBeenCalledWith('/movies/category/trending');
  });

  it('navigates to correct category for each section', async () => {
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

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getAllByText('View All')).toHaveLength(5);
    });

    const viewAllButtons = screen.getAllByText('View All');
    
    // Test each category navigation
    fireEvent.click(viewAllButtons[0]); // trending
    expect(mockNavigate).toHaveBeenCalledWith('/movies/category/trending');
    
    fireEvent.click(viewAllButtons[1]); // popular
    expect(mockNavigate).toHaveBeenCalledWith('/movies/category/popular');
    
    fireEvent.click(viewAllButtons[2]); // top_rated
    expect(mockNavigate).toHaveBeenCalledWith('/movies/category/top_rated');
    
    fireEvent.click(viewAllButtons[3]); // now_playing
    expect(mockNavigate).toHaveBeenCalledWith('/movies/category/now_playing');
    
    fireEvent.click(viewAllButtons[4]); // upcoming
    expect(mockNavigate).toHaveBeenCalledWith('/movies/category/upcoming');
  });

  it('shows both Load More and View All buttons when there are more pages', async () => {
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

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getAllByText('Load more')).toHaveLength(5);
      expect(screen.getAllByText('View All')).toHaveLength(5);
    });
  });

  it('shows only View All button when no more pages', async () => {
    const mockMovies = {
      page: 1,
      totalPages: 1,
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

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.queryByText('Load more')).not.toBeInTheDocument();
      expect(screen.getAllByText('View All')).toHaveLength(5);
    });
  });
});
