import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import MovieCategoryPage from '../pages/MovieCategoryPage';

// Mock useNavigate
const mockNavigate = vi.fn();

// Mock useParams to return invalid category
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ category: 'invalid' }),
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

describe('MovieCategoryPage - Invalid Category', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays invalid category message for invalid category', () => {
    renderWithProviders(<MovieCategoryPage />);

    expect(screen.getByText('Invalid Category')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });
});
