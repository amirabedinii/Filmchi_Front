import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { create } from 'zustand';
import { lightTheme, darkTheme } from './theme.ts';
import { type ReactNode, useEffect } from 'react';

interface ThemeState {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  toggleTheme: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
}));

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { mode } = useThemeStore();

  const theme = mode === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    // Persist theme mode if needed
  }, [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};


