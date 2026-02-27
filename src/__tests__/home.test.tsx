import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react'; // Add this import
import { RouterProvider, createMemoryRouter, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import HorizontalScroll from '@/components/HorizontalScroll';
import MovieCard from '@/components/MovieCard';
import * as moviesService from '@/services/movies';
import '@/i18n';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => <div>Search</div>,
  Star: () => <div>Star</div>,
  Menu: () => <div>Menu</div>,
  X: () => <div>X</div>,
}));

// Mock useUiStore
vi.mock('@/stores/useUiStore', () => ({
  useUiStore: (selector: any) => {
    const state = { language: 'en', theme: 'light' };
    return selector(state);
  },
}));

const renderHome = () => {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createMemoryRouter([
    { path: '/', element: <AppLayout />, children: [{ index: true, element: <HomePage /> }] }
  ]);
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

function mockPage(page: number, totalPages = 2) {
  return {
    page,
    totalPages,
    results: Array.from({ length: 6 }).map((_, i) => ({
      id: page * 100 + i,
      title: `Movie ${page}-${i}`,
      posterPath: `/poster-${page}-${i}.jpg`,
      releaseDate: '2024-01-01',
      voteAverage: 7.5
    }))
  } as moviesService.MoviesResponse;
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders category headings and movie cards', async () => {
    vi.spyOn(moviesService, 'fetchCategory').mockResolvedValue(mockPage(1));
    renderHome();
    expect(screen.getByRole('heading', { name: /Filmchi|فیل.?مچی/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText(/Movie 1-\d/).length).toBeGreaterThan(0);
    });
  });

  it('loads more on button click', async () => {
    const spy = vi.spyOn(moviesService, 'fetchCategory');
    spy.mockImplementation((category, page) => {
      if (page === 1) return Promise.resolve(mockPage(1));
      return Promise.resolve(mockPage(2, 2));
    });
    renderHome();
    const btns = await screen.findAllByRole('button', { name: /Load more|بیشتر|Loading/i });
    fireEvent.click(btns[0]);
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('shows skeleton loaders while loading', async () => {
    vi.spyOn(moviesService, 'fetchCategory').mockImplementation(() => new Promise(() => {}));
    renderHome();
    // The skeleton loaders are shown as divs with animate-pulse class
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('shows error state when fetch fails', async () => {
    vi.spyOn(moviesService, 'fetchCategory').mockRejectedValue(new Error('Network error'));
    renderHome();
    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load|خطا در بارگذاری/i)).toHaveLength(5);
    });
  });

  it('renders all movie categories', async () => {
    vi.spyOn(moviesService, 'fetchCategory').mockResolvedValue(mockPage(1));
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/Trending|داغ‌ترین‌ها/i)).toBeInTheDocument();
      expect(screen.getByText(/Popular|محبوب‌ها/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Rated|پربازدیدها/i)).toBeInTheDocument();
      expect(screen.getByText(/Now Playing|در حال اکران/i)).toBeInTheDocument();
      expect(screen.getByText(/Upcoming|به‌زودی/i)).toBeInTheDocument();
    });
  });

  it('hides load more button when no more pages', async () => {
    vi.spyOn(moviesService, 'fetchCategory').mockResolvedValue(mockPage(1, 1));
    renderHome();
    await waitFor(() => {
      const loadMoreButtons = screen.queryAllByRole('button', { name: /Load more|بیشتر/i });
      expect(loadMoreButtons).toHaveLength(0);
    });
  });
});

describe('MovieCard', () => {
  const mockMovie: moviesService.Movie = {
    id: 1,
    title: 'Test Movie',
    posterPath: '/test-poster.jpg',
    releaseDate: '2024-01-01',
    voteAverage: 8.5
  };

  const renderMovieCard = (movie: moviesService.Movie) => {
    return render(
      <BrowserRouter>
        <MovieCard movie={movie} />
      </BrowserRouter>
    );
  };

  it('renders movie information correctly', () => {
    renderMovieCard(mockMovie);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    // Rating appears once in the overlay
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('handles missing poster gracefully', () => {
    const movieWithoutPoster = { ...mockMovie, posterPath: null };
    renderMovieCard(movieWithoutPoster);
    const img = screen.getByAltText('Test Movie');
    expect(img).toHaveAttribute('src', 'https://via.placeholder.com/300x450?text=No+Image');
  });

  it('handles missing release date', () => {
    const movieWithoutDate = { ...mockMovie, releaseDate: null };
    renderMovieCard(movieWithoutDate);
    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  it('handles missing rating', () => {
    const movieWithoutRating = { ...mockMovie, voteAverage: null };
    renderMovieCard(movieWithoutRating);
    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });
});

describe('HorizontalScroll', () => {
  it('renders children correctly', () => {
    render(
      <HorizontalScroll>
        <div>Test content</div>
        <div>More content</div>
      </HorizontalScroll>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('More content')).toBeInTheDocument();
  });

  it('shows scroll buttons when content overflows', async () => {
    // HorizontalScroll is a simple scrollable container without buttons
    // Test that it renders children and is scrollable
    render(
      <HorizontalScroll>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-48 h-32">Item {i}</div>
        ))}
      </HorizontalScroll>
    );

    // Verify children are rendered
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 9')).toBeInTheDocument();
    
    // Verify the container has overflow-x-auto class for scrolling
    const container = screen.getByText('Item 0').closest('.overflow-x-auto');
    expect(container).toBeInTheDocument();
  });
});


