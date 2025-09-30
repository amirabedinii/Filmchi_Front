import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import RecommendationsPage from '@/pages/RecommendationsPage';
import { useAuthStore } from '@/stores/useAuthStore';
import * as recommendationsService from '@/services/recommendations';

// Mock the recommendations service
vi.mock('@/services/recommendations', () => ({
  getRecommendations: vi.fn(),
}));

// Mock the auth store
vi.mock('@/stores/useAuthStore');

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  Sparkles: () => <div>Sparkles</div>,
  Lightbulb: () => <div>Lightbulb</div>,
}));

const mockRecommendations = [
  {
    title: 'Back to the Future',
    year: 1985,
    reason: 'Classic time travel movie with a teenager going back to the 1950s',
    tmdbId: 105,
    posterPath: '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg',
    overview: 'Eighties teenager Marty McFly is accidentally sent back in time to 1955.',
  },
  {
    title: 'Groundhog Day',
    year: 1993,
    reason: 'Time loop movie where the protagonist relives the same day',
    tmdbId: 137,
    posterPath: '/gyudd8k9QdP9ES9sAPaq7wcLJUe.jpg',
    overview: 'A narcissistic TV weatherman finds himself stuck in a time loop.',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('RecommendationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to authenticated state
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      login: vi.fn(),
      logout: vi.fn(),
      setTokens: vi.fn(),
    } as any);
  });

  it('renders the recommendations page with title and form', () => {
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Get personalized movie recommendations powered by AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/sci-fi movies with time travel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get recommendations/i })).toBeInTheDocument();
  });

  it('displays example queries', () => {
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Sci-fi movies with time travel')).toBeInTheDocument();
    expect(screen.getByText('Action movies like John Wick')).toBeInTheDocument();
    expect(screen.getByText('Romantic comedies from the 90s')).toBeInTheDocument();
    expect(screen.getByText('Psychological thrillers with plot twists')).toBeInTheDocument();
  });

  it('allows user to type in the query textarea', async () => {
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'sci-fi movies with time travel' } });

    expect(textarea).toHaveValue('sci-fi movies with time travel');
  });

  it('clicking example query fills the textarea', async () => {
    vi.mocked(recommendationsService.getRecommendations).mockResolvedValue(mockRecommendations);

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const exampleButton = screen.getByText('Sci-fi movies with time travel');
    fireEvent.click(exampleButton);

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    await waitFor(() => {
      expect(textarea).toHaveValue('Sci-fi movies with time travel');
    });
  });

  it('submits form and displays recommendations on success', async () => {
    vi.mocked(recommendationsService.getRecommendations).mockResolvedValue(mockRecommendations);

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'sci-fi movies with time travel' } });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Recommended Movies')).toBeInTheDocument();
      expect(screen.getByText('Back to the Future')).toBeInTheDocument();
      expect(screen.getByText('Groundhog Day')).toBeInTheDocument();
    });

    // Check that reasons are displayed
    expect(screen.getByText(/Classic time travel movie/i)).toBeInTheDocument();
    expect(screen.getByText(/Time loop movie/i)).toBeInTheDocument();
  });

  it('displays loading state while fetching recommendations', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(recommendationsService.getRecommendations).mockReturnValue(promise as any);

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'sci-fi movies' } });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Getting recommendations...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!(mockRecommendations);
  });

  it('displays error state on API failure', async () => {
    vi.mocked(recommendationsService.getRecommendations).mockRejectedValue(new Error('API Error'));

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'sci-fi movies' } });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to get recommendations')).toBeInTheDocument();
      expect(screen.getByText(/There was an error getting your recommendations/i)).toBeInTheDocument();
    });
  });

  it('displays message when no recommendations are returned', async () => {
    vi.mocked(recommendationsService.getRecommendations).mockResolvedValue([]);

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'very obscure query' } });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('No recommendations found')).toBeInTheDocument();
      expect(screen.getByText(/Try a different query to get movie recommendations/i)).toBeInTheDocument();
    });
  });

  it('redirects to login when user is not authenticated', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: vi.fn(),
      logout: vi.fn(),
      setTokens: vi.fn(),
    } as any);

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'sci-fi movies' } });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    fireEvent.click(submitButton);

    // Should not call the API
    expect(recommendationsService.getRecommendations).not.toHaveBeenCalled();
  });

  it('disables submit button when query is empty', () => {
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when query is not empty', async () => {
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    const submitButton = screen.getByRole('button', { name: /get recommendations/i });

    expect(submitButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'test query' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('displays year information for each recommendation', async () => {
    vi.mocked(recommendationsService.getRecommendations).mockResolvedValue(mockRecommendations);

    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const textarea = screen.getByPlaceholderText(/sci-fi movies with time travel/i);
    fireEvent.change(textarea, { target: { value: 'sci-fi movies' } });

    const submitButton = screen.getByRole('button', { name: /get recommendations/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Year:\s*1985/)).toBeInTheDocument();
      expect(screen.getByText(/Year:\s*1993/)).toBeInTheDocument();
    });
  });

  it('back button navigates to previous page', () => {
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('switches language and displays translated content', async () => {
    await i18n.changeLanguage('fa');
    render(<RecommendationsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('پیشنهادهای هوش مصنوعی')).toBeInTheDocument();
    expect(screen.getByText(/پیشنهادهای فیلم شخصی‌سازی شده/i)).toBeInTheDocument();

    // Switch back to English
    await i18n.changeLanguage('en');
  });
});
