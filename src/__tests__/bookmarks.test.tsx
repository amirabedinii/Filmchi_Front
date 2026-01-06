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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  X: () => <div>X</div>,
  Bookmark: () => <div>Bookmark</div>,
  Star: () => <div>Star</div>,
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
      page: 1,
      results: [
        {
          id: 603,
          title: 'The Matrix',
          poster_path: '/poster.jpg',
          release_date: '1999-03-30',
          media_type: 'movie',
          bookmark_id: '1',
          bookmark_created_at: '2024-01-01T00:00:00Z',
        },
      ],
      total_pages: 1,
      total_results: 1,
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
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
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
      // There are multiple elements with this text, so use getAllByText
      const errorTexts = screen.getAllByText('Failed to load bookmarks');
      expect(errorTexts.length).toBeGreaterThan(0);
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
