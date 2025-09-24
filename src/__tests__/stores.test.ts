import { describe, it, expect } from 'vitest';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUiStore } from '@/stores/useUiStore';

describe('Zustand Stores', () => {
  it('updates and clears auth tokens', () => {
    const { setTokens, logout, tokens, isAuthenticated } = useAuthStore.getState();
    setTokens({ accessToken: 'a', refreshToken: 'r' });
    expect(useAuthStore.getState().tokens.accessToken).toBe('a');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    logout();
    expect(useAuthStore.getState().tokens.accessToken).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('changes language and theme in UI store', () => {
    const { setLanguage, setTheme } = useUiStore.getState();
    setLanguage('fa');
    expect(useUiStore.getState().language).toBe('fa');
    setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
  });
});
