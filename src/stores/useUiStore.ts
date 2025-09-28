import { create } from 'zustand';

type UiState = {
  language: 'en' | 'fa';
  setLanguage: (lang: 'en' | 'fa') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

const initialLang = (localStorage.getItem('filmchi_lang') as 'en' | 'fa') || 'en';
const initialTheme = (localStorage.getItem('filmchi_theme') as 'light' | 'dark') || 'light';

// Apply initial language direction and theme class ASAP
if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLang === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.classList.toggle('dark', initialTheme === 'dark');
}

export const useUiStore = create<UiState>((set) => ({
  language: initialLang,
  setLanguage: (lang) => {
    localStorage.setItem('filmchi_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    }
    set({ language: lang });
  },
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem('filmchi_theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  }
}));


