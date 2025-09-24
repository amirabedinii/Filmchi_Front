import { create } from 'zustand';

type UiState = {
  language: 'en' | 'fa';
  setLanguage: (lang: 'en' | 'fa') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

const initialLang = (localStorage.getItem('filmchi_lang') as 'en' | 'fa') || 'en';
const initialTheme = (localStorage.getItem('filmchi_theme') as 'light' | 'dark') || 'light';

export const useUiStore = create<UiState>((set) => ({
  language: initialLang,
  setLanguage: (lang) => {
    localStorage.setItem('filmchi_lang', lang);
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    set({ language: lang });
  },
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem('filmchi_theme', theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  }
}));


