import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import ListsPage from '../pages/ListsPage';
import { useAuthStore } from '../stores/useAuthStore';
import i18n from '../i18n';

// Mock the services
vi.mock('../services/lists', () => ({
  getList: vi.fn(),
  addToList: vi.fn(),
  removeFromList: vi.fn(),
}));

vi.mock('../services/movies', () => ({
  searchMovies: vi.fn(),
}));

// Mock the auth store
vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ listName: 'watchlist' }),
  };
});

// Mock toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ListsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login if user is not authenticated', async () => {
    // Mock unauthenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders watchlist page when authenticated', async () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock successful list fetch
    const { getList } = await import('../services/lists');
    (getList as any).mockResolvedValue([
      {
        tmdbId: 603,
        title: 'The Matrix',
        posterPath: '/poster.jpg',
        addedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    // Should render the page title
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(screen.getByText(/Manage your/)).toBeInTheDocument();
  });

  it('shows empty state when list is empty', async () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock empty list
    const { getList } = await import('../services/lists');
    (getList as any).mockResolvedValue([]);

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Your list is empty')).toBeInTheDocument();
      expect(screen.getByText('Add movies to start building your collection.')).toBeInTheDocument();
    });
  });

  it('shows error state when list fails to load', async () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock failed list fetch
    const { getList } = await import('../services/lists');
    (getList as any).mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load list')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('opens add movie dialog when add button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock empty list
    const { getList } = await import('../services/lists');
    (getList as any).mockResolvedValue([]);

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText('Your list is empty')).toBeInTheDocument();
    });

    // Click the add first movie button
    const addButton = screen.getByText('Add Your First Movie');
    await user.click(addButton);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Add Movie to List')).toBeInTheDocument();
      expect(screen.getByText('Search for movies to add')).toBeInTheDocument();
    });
  });

  it('searches for movies when typing in search input', async () => {
    const user = userEvent.setup();
    
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock empty list
    const { getList } = await import('../services/lists');
    (getList as any).mockResolvedValue([]);

    // Mock search results
    const { searchMovies } = await import('../services/movies');
    (searchMovies as any).mockResolvedValue({
      results: [
        {
          id: 603,
          title: 'The Matrix',
          posterPath: '/poster.jpg',
          releaseDate: '1999-03-30',
        },
      ],
    });

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    // Open add dialog
    await waitFor(() => {
      expect(screen.getByText('Your list is empty')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Your First Movie');
    await user.click(addButton);

    // Type in search input
    const searchInput = screen.getByPlaceholderText('Search movies...');
    await user.type(searchInput, 'Matrix');

    // Should search for movies (with debounce)
    await waitFor(() => {
      expect(searchMovies).toHaveBeenCalledWith({ query: 'Matrix' }, 1);
    }, { timeout: 1000 });
  });

  it('shows loading state initially', () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <TestWrapper>
        <ListsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading list...')).toBeInTheDocument();
  });
});
