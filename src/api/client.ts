import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const buildUrl = (path: string) => {
  if (!API_BASE_URL) return path; // assume dev proxy or same-origin relative
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
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


