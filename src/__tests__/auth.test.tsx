import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AppLayout from '@/shared/AppLayout';
import HomePage from '@/pages/HomePage';
import ProtectedRoute from '@/shared/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import * as authService from '@/services/auth';
import '@/i18n';

const renderWithRouter = (initialEntries: string[]) => {
  const queryClient = new QueryClient();
  const router = createMemoryRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
        {
          path: 'protected',
          element: <ProtectedRoute />,
          children: [
            { index: true, element: <div>Protected Content</div> }
          ]
        }
      ]
    }
  ], { initialEntries });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
};

describe('Auth Pages', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    // Reset zustand auth store state between tests
    useAuthStore.getState().logout();
  });

  it('logs in successfully and redirects home', async () => {
    vi.spyOn(authService, 'login').mockImplementation(async () => {
      useAuthStore.getState().setTokens({ accessToken: 'a', refreshToken: 'r' });
      return { accessToken: 'a', refreshToken: 'r' } as any;
    });
    renderWithRouter(['/login']);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /filmchi/i, level: 1 })).toBeInTheDocument()
    );
    expect(localStorage.getItem('filmchi_access_token')).toBe('a');
  });

  it('registers successfully and redirects home', async () => {
    vi.spyOn(authService, 'register').mockImplementation(async () => {
      useAuthStore.getState().setTokens({ accessToken: 'a', refreshToken: 'r' });
      return { accessToken: 'a', refreshToken: 'r' } as any;
    });
    renderWithRouter(['/register']);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'secret' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /filmchi/i, level: 1 })).toBeInTheDocument()
    );
    expect(localStorage.getItem('filmchi_access_token')).toBe('a');
  });

  it('redirects unauthenticated users from protected route to /login', async () => {
    renderWithRouter(['/protected']);
    expect(await screen.findByRole('heading', { name: /Login|ورود/i })).toBeInTheDocument();
  });

  it('shows protected content when authenticated', async () => {
    useAuthStore.getState().setTokens({ accessToken: 'a', refreshToken: 'r' });
    renderWithRouter(['/protected']);
    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('logout clears tokens and shows auth links', async () => {
    vi.spyOn(authService, 'logout').mockImplementation(async () => {
      useAuthStore.getState().logout();
    });
    useAuthStore.getState().setTokens({ accessToken: 'a', refreshToken: 'r' });
    renderWithRouter(['/']);

    const logoutBtn = await screen.findByRole('button', { name: /Logout|خروج/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(localStorage.getItem('filmchi_access_token')).toBeNull();
      expect(screen.getByRole('link', { name: /Login|ورود/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Register|ثبت‌نام/i })).toBeInTheDocument();
    });
  });
});


