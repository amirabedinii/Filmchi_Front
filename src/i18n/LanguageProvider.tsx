import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.ts';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const updateDir = () => {
      const dir = i18n.dir(i18n.language);
      document.documentElement.setAttribute('dir', dir);
      document.body.dir = dir;
    };
    updateDir();
    i18n.on('languageChanged', updateDir);
    return () => {
      i18n.off('languageChanged', updateDir);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};


