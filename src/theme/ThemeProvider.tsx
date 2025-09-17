import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { create } from 'zustand';
import { lightTheme, darkTheme } from './theme.ts';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import i18n from '../i18n/i18n.ts';

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

  // Track language to re-render on change so direction updates
  const [lang, setLang] = useState(i18n.language);
  useEffect(() => {
    const handler = (l: string) => setLang(l);
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  // Create Emotion cache based on current language direction
  const isRtl = i18n.dir(lang) === 'rtl';
  const cache = useMemo(() => {
    return createCache({ key: isRtl ? 'mui-rtl' : 'mui', stylisPlugins: isRtl ? [rtlPlugin] : [] });
  }, [isRtl]);

  useEffect(() => {
    // Persist theme mode if needed
  }, [mode]);

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={{ ...theme, direction: isRtl ? 'rtl' : 'ltr' }}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
};


