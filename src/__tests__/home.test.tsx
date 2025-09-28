import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react'; // Add this import
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import HorizontalScroll from '@/components/HorizontalScroll';
import MovieCard from '@/components/MovieCard';
import * as moviesService from '@/services/movies';
import '@/i18n';

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

  it('renders movie information correctly', () => {
    render(<MovieCard movie={mockMovie} />);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    // There are two instances of 8.5 (overlay and bottom), so use getAllByText
    expect(screen.getAllByText('8.5')).toHaveLength(2);
  });

  it('handles missing poster gracefully', () => {
    const movieWithoutPoster = { ...mockMovie, posterPath: null };
    render(<MovieCard movie={movieWithoutPoster} />);
    const img = screen.getByAltText('Test Movie');
    expect(img).toHaveAttribute('src', 'https://via.placeholder.com/300x450?text=No+Image');
  });

  it('handles missing release date', () => {
    const movieWithoutDate = { ...mockMovie, releaseDate: null };
    render(<MovieCard movie={movieWithoutDate} />);
    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  it('handles missing rating', () => {
    const movieWithoutRating = { ...mockMovie, voteAverage: null };
    render(<MovieCard movie={movieWithoutRating} />);
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
    // Mock scrollWidth > clientWidth
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 500,
    });

    render(
      <HorizontalScroll>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-48 h-32">Item {i}</div>
        ))}
      </HorizontalScroll>
    );

    // Wait for useEffect to run and right button to appear
    await waitFor(() => {
      const scrollButtons = screen.getAllByRole('button', { name: /Scroll right/i });
      expect(scrollButtons).toHaveLength(1);
    });
  });
});


