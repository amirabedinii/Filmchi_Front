import { Outlet, Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/useUiStore';
import { useEffect } from 'react';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language, i18n]);

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="font-semibold">{t('app.title')}</Link>
          <div className="flex-1 max-w-md">
            <input
              aria-label={t('app.search_placeholder')}
              className="w-full border rounded px-3 py-1.5 text-sm"
              placeholder={t('app.search_placeholder')}
            />
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/" className={({ isActive }) => isActive ? 'font-medium' : ''}>{t('app.home')}</NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'font-medium' : ''}>{t('app.login')}</NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? 'font-medium' : ''}>{t('app.register')}</NavLink>
            <select
              aria-label={t('app.theme')}
              className="border rounded px-2 py-1"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">{t('app.light')}</option>
              <option value="dark">{t('app.dark')}</option>
            </select>
            <select
              aria-label={t('app.language')}
              className="border rounded px-2 py-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'fa')}
            >
              <option value="en">{t('app.english')}</option>
              <option value="fa">{t('app.persian')}</option>
            </select>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center text-sm opacity-75">
          © {new Date().getFullYear()} Filmchi
        </div>
      </footer>
    </div>
  );
}


