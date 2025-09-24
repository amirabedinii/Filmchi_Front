import { create } from 'zustand';

type Tokens = { accessToken: string | null; refreshToken: string | null };

type AuthState = {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  tokens: Tokens;
  setTokens: (tokens: Tokens) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('filmchi_access_token'),
  user: null,
  tokens: {
    accessToken: localStorage.getItem('filmchi_access_token'),
    refreshToken: localStorage.getItem('filmchi_refresh_token')
  },
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem('filmchi_access_token', accessToken);
    if (refreshToken) localStorage.setItem('filmchi_refresh_token', refreshToken);
    set({
      tokens: { accessToken, refreshToken },
      isAuthenticated: !!accessToken
    });
  },
  logout: () => {
    localStorage.removeItem('filmchi_access_token');
    localStorage.removeItem('filmchi_refresh_token');
    set({
      isAuthenticated: false,
      user: null,
      tokens: { accessToken: null, refreshToken: null }
    });
  },
  setUser: (user) => set({ user })
}));


