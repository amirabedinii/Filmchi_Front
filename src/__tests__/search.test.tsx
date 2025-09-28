import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import SearchPage from '../pages/SearchPage';
import AppLayout from '../shared/AppLayout';
import { searchMovies, fetchGenres } from '../services/movies';

// Mock the services
vi.mock('../services/movies');
vi.mock('../services/auth');

const mockSearchMovies = vi.mocked(searchMovies);
const mockFetchGenres = vi.mocked(fetchGenres);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock Zustand stores
vi.mock('../stores/useUiStore', () => ({
  useUiStore: (selector: any) => {
    const state = { language: 'en', theme: 'light', setLanguage: vi.fn(), setTheme: vi.fn() };
    return selector(state);
  },
}));

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { isAuthenticated: false, user: null, token: null };
    return selector(state);
  },
}));

const mockMovies = {
  page: 1,
  totalPages: 5,
  results: [
    {
      id: 1,
      title: 'The Matrix',
      posterPath: '/poster1.jpg',
      releaseDate: '1999-03-30',
      voteAverage: 8.7,
      overview: 'A computer programmer discovers reality.',
      genreIds: [28, 878],
    },
    {
      id: 2,
      title: 'Inception',
      posterPath: '/poster2.jpg',
      releaseDate: '2010-07-16',
      voteAverage: 8.8,
      overview: 'A dream within a dream.',
      genreIds: [28, 878, 53],
    },
  ],
};

const mockGenres = [
  { id: 28, name: 'Action' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 18, name: 'Drama' },
];

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  { initialEntries = ['/search'] } = {}
) {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { path: 'search', element: <SearchPage /> },
        ],
      },
    ],
    { initialEntries }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>
  );
}

function renderSearchPageWithProviders(
  { initialEntries = ['/search'] } = {}
) {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [{ path: '/search', element: <SearchPage /> }],
    { initialEntries }
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>
  );
}

describe('SearchPage', () => {
  beforeEach(() => {
    mockFetchGenres.mockResolvedValue(mockGenres);
    mockSearchMovies.mockResolvedValue(mockMovies);
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders search page correctly', async () => {
    renderSearchPageWithProviders();
    
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays search form and handles input', async () => {
    renderSearchPageWithProviders();
    
    const searchInput = screen.getByPlaceholderText('Search movies...');
    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    
    expect(searchInput).toHaveValue('Matrix');
  });

  it('performs search when form is submitted', async () => {
    renderSearchPageWithProviders();
    
    const searchInput = screen.getByPlaceholderText('Search movies...');
    const searchButton = screen.getByRole('button', { name: /search results/i });
    
    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'Matrix' }),
        1
      );
    });
  });

  it('displays search results when query is provided', async () => {
    renderSearchPageWithProviders({ initialEntries: ['/search?q=Matrix'] });
    
    await waitFor(() => {
      expect(screen.getByText('Search results for')).toBeInTheDocument();
      expect(screen.getByText('"Matrix"')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });

  it('shows and hides filters panel', async () => {
    renderSearchPageWithProviders();
    
    const filtersButton = screen.getByText('Filters');
    
    // Filters should not be visible initially
    expect(screen.queryByText('Genre')).not.toBeInTheDocument();
    
    // Click to show filters
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByText('Genre')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
      expect(screen.getByText('Sort By')).toBeInTheDocument();
    });
    
    // Click to hide filters
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Genre')).not.toBeInTheDocument();
    });
  });

  it('loads and displays genres in filter dropdown', async () => {
    renderSearchPageWithProviders();
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      const genreSelect = screen.getByDisplayValue('All Genres');
      expect(genreSelect).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockFetchGenres).toHaveBeenCalled();
    });
  });

  it('applies filters correctly', async () => {
    renderSearchPageWithProviders({ initialEntries: ['/search?q=action'] });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      const genreSelect = screen.getByDisplayValue('All Genres');
      fireEvent.change(genreSelect, { target: { value: '28' } });
      
      const yearInput = screen.getByPlaceholderText('Any Year');
      fireEvent.change(yearInput, { target: { value: '2020' } });
      
      const applyButton = screen.getByText('Apply Filters');
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'action',
          genre: '28',
          year: 2020,
        }),
        1
      );
    });
  });

  it('clears filters correctly', async () => {
    renderSearchPageWithProviders({ 
      initialEntries: ['/search?q=action&genre=28&year=2020&rating=7.0'] 
    });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      const clearButton = screen.getByText('Clear Filters');
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'action',
          sortBy: 'popularity',
          sortOrder: 'desc',
        }),
        1
      );
    });
  });

  it('displays search history', async () => {
    const mockHistory = ['Matrix', 'Inception', 'Avatar'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
    
    renderSearchPageWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('Matrix')).toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('Avatar')).toBeInTheDocument();
    });
  });

  it('clears search history', async () => {
    const mockHistory = ['Matrix', 'Inception'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));
    
    renderSearchPageWithProviders();
    
    await waitFor(() => {
      const clearHistoryButton = screen.getByText('Clear History');
      fireEvent.click(clearHistoryButton);
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('filmchi-search-history');
  });

  it('saves search to history when performing search', async () => {
    renderSearchPageWithProviders();
    
    const searchInput = screen.getByPlaceholderText('Search movies...');
    const searchButton = screen.getByRole('button', { name: /search results/i });
    
    fireEvent.change(searchInput, { target: { value: 'New Search' } });
    fireEvent.click(searchButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'filmchi-search-history',
        expect.stringContaining('New Search')
      );
    });
  });

  it('displays no results message when search returns empty', async () => {
    mockSearchMovies.mockResolvedValue({
      page: 1,
      totalPages: 0,
      results: [],
    });
    
    renderSearchPageWithProviders({ initialEntries: ['/search?q=nonexistent'] });
    
    await waitFor(() => {
      expect(screen.getByText('No movies found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters')).toBeInTheDocument();
    });
  });

  it('displays error message when search fails', async () => {
    mockSearchMovies.mockRejectedValue(new Error('Search failed'));
    
    renderSearchPageWithProviders({ initialEntries: ['/search?q=error'] });
    
    await waitFor(() => {
      expect(screen.getByText('Search failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles sort options correctly', async () => {
    renderSearchPageWithProviders({ initialEntries: ['/search?q=test'] });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue('Popularity');
      fireEvent.change(sortSelect, { target: { value: 'vote_average' } });
      
      const ascRadio = screen.getByDisplayValue('asc');
      fireEvent.click(ascRadio);
      
      const applyButton = screen.getByText('Apply Filters');
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'vote_average',
          sortOrder: 'asc',
        }),
        1
      );
    });
  });

  it('shows loading skeleton while searching', async () => {
    // Make search pending
    mockSearchMovies.mockImplementation(() => new Promise(() => {}));
    
    renderSearchPageWithProviders({ initialEntries: ['/search?q=loading'] });
    
    await waitFor(() => {
      const skeletons = screen.getAllByTestId(/loading/i) || 
                     document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('handles rating filter correctly', async () => {
    renderSearchPageWithProviders({ initialEntries: ['/search?q=test'] });
    
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      const ratingInput = screen.getByPlaceholderText('Any Rating');
      fireEvent.change(ratingInput, { target: { value: '7.5' } });
      
      const applyButton = screen.getByText('Apply Filters');
      fireEvent.click(applyButton);
    });

    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          minRating: 7.5,
        }),
        1
      );
    });
  });

  it('displays results count', async () => {
    renderSearchPageWithProviders({ initialEntries: ['/search?q=Matrix'] });
    
    await waitFor(() => {
      expect(screen.getByText(/\d+ results found/)).toBeInTheDocument();
    });
  });

  it('handles infinite scroll pagination', async () => {
    const mockPage2 = {
      page: 2,
      totalPages: 5,
      results: [
        {
          id: 3,
          title: 'Avatar',
          posterPath: '/poster3.jpg',
          releaseDate: '2009-12-18',
          voteAverage: 7.8,
        },
      ],
    };

    mockSearchMovies
      .mockResolvedValueOnce(mockMovies) // First page
      .mockResolvedValueOnce(mockPage2); // Second page

    renderSearchPageWithProviders({ initialEntries: ['/search?q=movie'] });

    // Wait for first page to load
    await waitFor(() => {
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    // Check if "Load more" button is available and click it
    await waitFor(() => {
      const loadMoreButton = screen.getByText('Load more');
      expect(loadMoreButton).toBeInTheDocument();
      fireEvent.click(loadMoreButton);
    });

    // Check that second page was requested
    await waitFor(() => {
      expect(mockSearchMovies).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'movie' }),
        2
      );
    });
  });
});

describe('Search Integration with AppLayout', () => {
  beforeEach(() => {
    mockFetchGenres.mockResolvedValue(mockGenres);
    mockSearchMovies.mockResolvedValue(mockMovies);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to search page when typing in navbar search', async () => {
    renderWithProviders(<div />, { initialEntries: ['/'] });
    
    const searchInput = screen.getByPlaceholderText('Search movies...');
    
    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    
    // Wait for debounced navigation
    await waitFor(() => {
      expect(window.location.pathname).toBe('/search');
    }, { timeout: 1000 });
  });

  it('submits search form from navbar', async () => {
    renderWithProviders(<div />, { initialEntries: ['/'] });
    
    const searchForm = screen.getByRole('form') || 
                      screen.getByPlaceholderText('Search movies...').closest('form');
    const searchInput = screen.getByPlaceholderText('Search movies...');
    
    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    
    if (searchForm) {
      fireEvent.submit(searchForm);
    }
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/search');
      expect(window.location.search).toContain('q=Matrix');
    });
  });

  it('handles empty search gracefully', async () => {
    renderWithProviders(<div />, { initialEntries: ['/'] });
    
    const searchForm = screen.getByPlaceholderText('Search movies...').closest('form');
    const searchInput = screen.getByPlaceholderText('Search movies...');
    
    // Try to submit empty search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    if (searchForm) {
      fireEvent.submit(searchForm);
    }
    
    // Should not navigate to search page
    expect(window.location.pathname).toBe('/');
  });
});

describe('Search Translations', () => {
  beforeEach(() => {
    mockFetchGenres.mockResolvedValue(mockGenres);
    mockSearchMovies.mockResolvedValue(mockMovies);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays Persian translations correctly', async () => {
    await i18n.changeLanguage('fa');
    
    renderSearchPageWithProviders();
    
    expect(screen.getByText('نتایج جست‌وجو')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('جست‌وجوی فیلم...')).toBeInTheDocument();
    expect(screen.getByText('فیلترها')).toBeInTheDocument();
  });

  it('switches between languages correctly', async () => {
    renderSearchPageWithProviders();
    
    // Start with English
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    
    // Switch to Persian
    await i18n.changeLanguage('fa');
    
    await waitFor(() => {
      expect(screen.getByText('نتایج جست‌وجو')).toBeInTheDocument();
    });
  });
});