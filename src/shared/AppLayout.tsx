import { Outlet, Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/useUiStore';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { logout as logoutReq } from '@/services/auth';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language, i18n]);

  useEffect(() => {
    if(debouncedSearchText.trim()){
      navigate(`/search?q=${encodeURIComponent(debouncedSearchText.trim())}`);
    }
    // Optionally, navigate to a default route if search text is cleared.
  }, [debouncedSearchText, navigate]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-zinc-900 dark:text-zinc-100 w-full overflow-x-hidden">
      <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full">
          <Link to="/" className="font-semibold text-sm sm:text-base lg:text-lg shrink-0 whitespace-nowrap">{t('app.title')}</Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <input
                type="text"
                value={searchText}
                onChange={handleInputChange}
                aria-label={t('app.search_placeholder')}
                className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('app.search_placeholder')}
              />
            </div>
          </form>
          <nav className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 text-xs sm:text-sm shrink-0">
            <NavLink to="/" className={({ isActive }) => `hidden md:inline ${isActive ? 'font-medium' : ''}`}>{t('app.home')}</NavLink>
            {!isAuthenticated && (
              <>
                <NavLink to="/login" className={({ isActive }) => `whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('app.login')}</NavLink>
                <NavLink to="/register" className={({ isActive }) => `hidden sm:inline whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('app.register')}</NavLink>
              </>
            )}
            {isAuthenticated && (
              <>
                <NavLink to="/bookmarks" className={({ isActive }) => `hidden sm:inline whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('bookmarks.title')}</NavLink>
                <div className="relative group hidden md:inline">
                  <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                    {t('app.lists')} ▾
                  </button>
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <NavLink to="/lists/watchlist" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('lists.watchlist')}</NavLink>
                    <NavLink to="/lists/favorites" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('lists.favorites')}</NavLink>
                    <NavLink to="/lists/watched" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('lists.watched')}</NavLink>
                  </div>
                </div>
                <NavLink to="/recommendations" className={({ isActive }) => `hidden lg:inline whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('app.recommendations')}</NavLink>
                <div className="relative group hidden sm:inline">
                  <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                    {t('app.profile')} ▾
                  </button>
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <NavLink to="/profile" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('profile.title')}</NavLink>
                    {/* TODO: Uncomment when SettingsPage is ready to be used */}
                    {/* <NavLink to="/settings" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('settings.title')}</NavLink> */}
                    <NavLink to="/account" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('account.title')}</NavLink>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={async () => {
                        await logoutReq();
                        toast.success(t('auth.logout'));
                        navigate('/');
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                    >
                      {t('auth.logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
            <select
              aria-label={t('app.theme')}
              className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-1 sm:px-1.5 py-1 text-xs sm:text-sm cursor-pointer"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">☀️</option>
              <option value="dark">🌙</option>
            </select>
            <select
              aria-label={t('app.language')}
              className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded px-1 sm:px-1.5 py-1 text-xs sm:text-sm cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'fa')}
            >
              <option value="en">EN</option>
              <option value="fa">فا</option>
            </select>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 h-12 sm:h-14 flex items-center text-xs sm:text-sm opacity-75">
          © {new Date().getFullYear()} Filmchi
        </div>
      </footer>
    </div>
  );
}


