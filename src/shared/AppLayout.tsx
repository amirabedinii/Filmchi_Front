import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/useUiStore';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { logout as logoutReq } from '@/services/auth';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language, i18n]);

  return (
    <div className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="font-semibold">{t('app.title')}</Link>
          <div className="flex-1 max-w-md">
            <input
              aria-label={t('app.search_placeholder')}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded px-3 py-1.5 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('app.search_placeholder')}
            />
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink to="/" className={({ isActive }) => isActive ? 'font-medium' : ''}>{t('app.home')}</NavLink>
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'font-medium' : ''}>{t('app.login')}</NavLink>
                <NavLink to="/register" className={({ isActive }) => isActive ? 'font-medium' : ''}>{t('app.register')}</NavLink>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={async () => {
                  await logoutReq();
                  toast.success(t('auth.logout'));
                  navigate('/');
                }}
                className="text-sm border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-2 py-1"
              >
                {t('auth.logout')}
              </button>
            )}
            <select
              aria-label={t('app.theme')}
              className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-2 py-1"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">{t('app.light')}</option>
              <option value="dark">{t('app.dark')}</option>
            </select>
            <select
              aria-label={t('app.language')}
              className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-2 py-1"
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
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center text-sm opacity-75">
          © {new Date().getFullYear()} Filmchi
        </div>
      </footer>
    </div>
  );
}


