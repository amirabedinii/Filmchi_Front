import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import BookmarksPage from '../pages/BookmarksPage';
import { useAuthStore } from '../stores/useAuthStore';
import i18n from '../i18n';

// Mock the services
vi.mock('../services/movies', () => ({
  fetchBookmarks: vi.fn(),
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
  };
});

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

describe('BookmarksPage', () => {
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
        <BookmarksPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders bookmarks page when authenticated', async () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock successful bookmarks fetch
    const { fetchBookmarks } = await import('../services/movies');
    (fetchBookmarks as any).mockResolvedValue({
      bookmarks: [
        {
          id: '1',
          tmdbId: 603,
          movieTitle: 'The Matrix',
          moviePosterPath: '/poster.jpg',
          movieReleaseDate: '1999-03-30',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    render(
      <TestWrapper>
        <BookmarksPage />
      </TestWrapper>
    );

    // Should render the page title
    expect(screen.getByText('My Bookmarks')).toBeInTheDocument();
    expect(screen.getByText('Movies you\'ve saved to watch later')).toBeInTheDocument();
  });

  it('shows empty state when no bookmarks exist', async () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock empty bookmarks
    const { fetchBookmarks } = await import('../services/movies');
    (fetchBookmarks as any).mockResolvedValue({
      bookmarks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });

    render(
      <TestWrapper>
        <BookmarksPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No bookmarks yet')).toBeInTheDocument();
      expect(screen.getByText('Start adding movies to your bookmarks by clicking the bookmark button on any movie.')).toBeInTheDocument();
    });
  });

  it('shows error state when bookmarks fail to load', async () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    // Mock failed bookmarks fetch
    const { fetchBookmarks } = await import('../services/movies');
    (fetchBookmarks as any).mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <BookmarksPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load bookmarks')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    // Mock authenticated state
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <TestWrapper>
        <BookmarksPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading bookmarks...')).toBeInTheDocument();
  });
});
