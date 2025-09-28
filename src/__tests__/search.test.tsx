import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from '@/shared/AppLayout';
import SearchPage from '@/pages/SearchPage';
import * as moviesService from '@/services/movies';
import '@/i18n';

const renderSearch = (initialEntries = ['/search']) => {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const router = createMemoryRouter([
    { 
      path: '/', 
      element: <AppLayout />, 
      children: [
        { path: 'search', element: <SearchPage /> }
      ] 
    }
  ], { initialEntries });
  
  return render(
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

function mockSearchResponse(page: number, query: string, totalPages = 2) {
  return {
    page,
    totalPages,
    results: Array.from({ length: 6 }).map((_, i) => ({
      id: page * 100 + i,
      title: `${query} Movie ${page}-${i}`,
      posterPath: `/poster-${page}-${i}.jpg`,
      releaseDate: '2024-01-01',
      voteAverage: 7.5,
      overview: `Overview for ${query} movie ${page}-${i}`,
      genreIds: [1, 2],
      adult: false,
      originalLanguage: 'en',
      popularity: 100.5
    }))
  } as moviesService.MoviesResponse;
}

function mockGenres() {
  return [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Drama' },
    { id: 4, name: 'Horror' },
    { id: 5, name: 'Romance' }
  ] as moviesService.Genre[];
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders search page with empty state', async () => {
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    renderSearch();
    
    expect(screen.getByText(/Search Results|نتایج جست‌وجو/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search movies|جست‌وجوی فیلم/i)).toBeInTheDocument();
    expect(screen.getByText(/Filters|فیلترها/i)).toBeInTheDocument();
  });

  it('performs search when query is provided', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue(mockSearchResponse(1, 'Batman'));
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Batman']);
    
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'Batman' }),
        1
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Batman Movie 1-0')).toBeInTheDocument();
    });
  });

  it('handles search form submission', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue(mockSearchResponse(1, 'Superman'));
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch();
    
    const searchInput = screen.getByPlaceholderText(/Search movies|جست‌وجوی فیلم/i);
    const searchButton = screen.getByRole('button', { name: /Search Results|نتایج جست‌وجو/i });
    
    fireEvent.change(searchInput, { target: { value: 'Superman' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'Superman' }),
        1
      );
    });
  });

  it('shows and hides filters panel', async () => {
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    renderSearch();
    
    const filtersButton = screen.getByText(/Filters|فیلترها/i);
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Genre|ژانر/i)).toBeInTheDocument();
      expect(screen.getByText(/Year|سال/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum Rating|حداقل امتیاز/i)).toBeInTheDocument();
    });
    
    fireEvent.click(filtersButton);
    await waitFor(() => {
      expect(screen.queryByText(/Apply Filters|اعمال فیلترها/i)).not.toBeInTheDocument();
    });
  });

  it('applies search filters', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue(mockSearchResponse(1, 'Action'));
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Action']);
    
    // Open filters
    const filtersButton = screen.getByText(/Filters|فیلترها/i);
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Genre|ژانر/i)).toBeInTheDocument();
    });
    
    // Set genre filter
    const genreSelect = screen.getByDisplayValue(/All Genres|همه ژانرها/i);
    fireEvent.change(genreSelect, { target: { value: '1' } });
    
    // Set year filter
    const yearInput = screen.getByPlaceholderText(/Any Year|هر سالی/i);
    fireEvent.change(yearInput, { target: { value: '2024' } });
    
    // Apply filters
    const applyButton = screen.getByText(/Apply Filters|اعمال فیلترها/i);
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ 
          query: 'Action',
          genre: '1',
          year: 2024
        }),
        1
      );
    });
  });

  it('clears all filters', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue(mockSearchResponse(1, 'Test'));
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Test&genre=1&year=2024&rating=7']);
    
    // Open filters
    const filtersButton = screen.getByText(/Filters|فیلترها/i);
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Genre
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument(); // Year
      expect(screen.getByDisplayValue('7')).toBeInTheDocument(); // Rating
    });
    
    // Clear filters
    const clearButton = screen.getByText(/Clear Filters|پاک کردن فیلترها/i);
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ 
          query: 'Test'
          // No other filters should be present
        }),
        1
      );
    });
  });

  it('shows loading state during search', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockImplementation(() => new Promise(() => {})); // Never resolves
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Loading']);
    
    await waitFor(() => {
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  it('shows error state when search fails', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockRejectedValue(new Error('Search failed'));
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Error']);
    
    await waitFor(() => {
      expect(screen.getByText(/Search failed|جست‌وجو ناموفق بود/i)).toBeInTheDocument();
    });
  });

  it('shows no results state when no movies found', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue({
      page: 1,
      totalPages: 1,
      results: []
    });
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=NoResults']);
    
    await waitFor(() => {
      expect(screen.getByText(/No movies found|فیلمی یافت نشد/i)).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting|عبارت جست‌وجو یا فیلترها را تغییر دهید/i)).toBeInTheDocument();
    });
  });

  it('loads more results with infinite scroll', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockImplementation((filters, page) => {
      if (page === 1) return Promise.resolve(mockSearchResponse(1, 'Infinite', 2));
      return Promise.resolve(mockSearchResponse(2, 'Infinite', 2));
    });
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Infinite']);
    
    // Wait for initial results
    await waitFor(() => {
      expect(screen.getByText('Infinite Movie 1-0')).toBeInTheDocument();
    });
    
    // Click load more button
    const loadMoreButton = screen.getByText(/Load more|بیشتر/i);
    fireEvent.click(loadMoreButton);
    
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'Infinite' }),
        2
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Infinite Movie 2-0')).toBeInTheDocument();
    });
  });

  it('manages search history', async () => {
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch();
    
    const searchInput = screen.getByPlaceholderText(/Search movies|جست‌وجوی فیلم/i);
    const searchButton = screen.getByRole('button', { name: /Search Results|نتایج جست‌وجو/i });
    
    // Perform first search
    fireEvent.change(searchInput, { target: { value: 'Batman' } });
    fireEvent.click(searchButton);
    
    // Go back to empty search
    renderSearch(['/search']);
    
    await waitFor(() => {
      expect(screen.getByText(/Recent Searches|جست‌وجوهای اخیر/i)).toBeInTheDocument();
      expect(screen.getByText('Batman')).toBeInTheDocument();
    });
    
    // Click on history item
    const historyItem = screen.getByText('Batman');
    fireEvent.click(historyItem);
    
    // Should navigate to search with that query
    expect(window.location.search).toContain('q=Batman');
  });

  it('clears search history', async () => {
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    // Set up some history
    localStorage.setItem('filmchi-search-history', JSON.stringify(['Batman', 'Superman']));
    
    renderSearch();
    
    await waitFor(() => {
      expect(screen.getByText(/Recent Searches|جست‌وجوهای اخیر/i)).toBeInTheDocument();
      expect(screen.getByText('Batman')).toBeInTheDocument();
    });
    
    // Clear history
    const clearButton = screen.getByText(/Clear History|پاک کردن تاریخچه/i);
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/Recent Searches|جست‌وجوهای اخیر/i)).not.toBeInTheDocument();
    });
    
    expect(localStorage.getItem('filmchi-search-history')).toBeNull();
  });

  it('handles sort options correctly', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue(mockSearchResponse(1, 'Sort'));
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Sort']);
    
    // Open filters
    const filtersButton = screen.getByText(/Filters|فیلترها/i);
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sort By|مرتب‌سازی بر اساس/i)).toBeInTheDocument();
    });
    
    // Change sort by
    const sortSelect = screen.getByDisplayValue(/Popularity|محبوبیت/i);
    fireEvent.change(sortSelect, { target: { value: 'vote_average' } });
    
    // Change sort order
    const ascRadio = screen.getByDisplayValue('asc');
    fireEvent.click(ascRadio);
    
    // Apply filters
    const applyButton = screen.getByText(/Apply Filters|اعمال فیلترها/i);
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ 
          query: 'Sort',
          sortBy: 'vote_average',
          sortOrder: 'asc'
        }),
        1
      );
    });
  });

  it('prevents search with empty query', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch();
    
    const searchButton = screen.getByRole('button', { name: /Search Results|نتایج جست‌وجو/i });
    
    // Try to search with empty query
    fireEvent.click(searchButton);
    
    // Should not call search API
    expect(searchSpy).not.toHaveBeenCalled();
    
    // Button should be disabled
    expect(searchButton).toBeDisabled();
  });

  it('displays search results count', async () => {
    const searchSpy = vi.spyOn(moviesService, 'searchMovies');
    searchSpy.mockResolvedValue(mockSearchResponse(1, 'Count', 5)); // 5 pages = ~100 results
    vi.spyOn(moviesService, 'fetchGenres').mockResolvedValue(mockGenres());
    
    renderSearch(['/search?q=Count']);
    
    await waitFor(() => {
      expect(screen.getByText(/100 results found|100 نتیجه یافت شد/i)).toBeInTheDocument();
    });
  });
});

describe('Search API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls search API with correct parameters', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: mockSearchResponse(1, 'Test') });
    vi.doMock('@/services/api', () => ({ default: { get: mockApi } }));
    
    const { searchMovies } = await import('@/services/movies');
    
    const filters: moviesService.SearchFilters = {
      query: 'Test Movie',
      genre: '1',
      year: 2024,
      minRating: 7.5,
      sortBy: 'vote_average',
      sortOrder: 'desc'
    };
    
    await searchMovies(filters, 2);
    
    expect(mockApi).toHaveBeenCalledWith('/movies/search', {
      params: {
        page: 2,
        query: 'Test Movie',
        genre: '1',
        year: 2024,
        min_rating: 7.5,
        sort_by: 'vote_average',
        sort_order: 'desc'
      }
    });
  });

  it('omits undefined filter parameters', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: mockSearchResponse(1, 'Simple') });
    vi.doMock('@/services/api', () => ({ default: { get: mockApi } }));
    
    const { searchMovies } = await import('@/services/movies');
    
    const filters: moviesService.SearchFilters = {
      query: 'Simple Search'
    };
    
    await searchMovies(filters);
    
    expect(mockApi).toHaveBeenCalledWith('/movies/search', {
      params: {
        page: 1,
        query: 'Simple Search'
      }
    });
  });

  it('fetches genres correctly', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: { genres: mockGenres() } });
    vi.doMock('@/services/api', () => ({ default: { get: mockApi } }));
    
    const { fetchGenres } = await import('@/services/movies');
    
    const genres = await fetchGenres();
    
    expect(mockApi).toHaveBeenCalledWith('/movies/genres');
    expect(genres).toEqual(mockGenres());
  });
});
