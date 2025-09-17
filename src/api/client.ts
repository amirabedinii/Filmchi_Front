import { QueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth.ts';

export const queryClient = new QueryClient();

export const baseUrl: string = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3001';

export const buildUrl = (path: string): string => {
  if (!baseUrl) return path; // assume dev proxy or same-origin relative
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(buildUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const register = async (email: string, password: string) => {
  const response = await fetch(buildUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Register failed');
  return response.json();
};


export const getAuthHeaders = (): Record<string, string> => {
  const accessToken = useAuth.getState().accessToken;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

export const fetchWithAuth = async (input: string | URL, init: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();
  const mergedHeaders: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    ...authHeaders,
  };
  const finalInit: RequestInit = { ...init, headers: mergedHeaders };
  const url = typeof input === 'string' ? input : input.toString();
  return fetch(url, finalInit);
};


