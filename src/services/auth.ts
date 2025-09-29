import api from './api';
import { useAuthStore } from '@/stores/useAuthStore';

type LoginPayload = { email: string; password: string };
type RegisterPayload = { email: string; password: string };

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user?: { 
    id: string; 
    email: string;
    createdAt?: string;
  };
};

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  useAuthStore.getState().setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  if (data.user) {
    useAuthStore.getState().setUser(data.user);
  }
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  useAuthStore.getState().setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  if (data.user) {
    useAuthStore.getState().setUser(data.user);
  }
  return data;
}

export async function logout() {
  try {
    const refreshToken = useAuthStore.getState().tokens.refreshToken;
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    useAuthStore.getState().logout();
  }
}


