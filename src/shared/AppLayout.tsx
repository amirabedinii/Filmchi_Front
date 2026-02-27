import { Outlet, Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/stores/useUiStore';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { logout as logoutReq } from '@/services/auth';
import toast from 'react-hot-toast';
import { Search, Menu, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const MOBILE_NAV_BREAKPOINT = 768; // md

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false); // for slide-in animation
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
  }, [debouncedSearchText, navigate]);

  // Close mobile menu when viewport reaches desktop
  useEffect(() => {
    const closeIfDesktop = () => {
      if (window.innerWidth >= MOBILE_NAV_BREAKPOINT) setMenuOpen(false);
    };
    window.addEventListener('resize', closeIfDesktop);
    return () => window.removeEventListener('resize', closeIfDesktop);
  }, []);

  // Slide-in: when menu opens, start panel off-screen then animate in
  useEffect(() => {
    if (!menuOpen) {
      setPanelVisible(false);
      return;
    }
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

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
          {/* Mobile: order 3 (right). Desktop: natural order (first) */}
          <Link to="/" className="order-3 md:order-none font-semibold text-sm sm:text-base lg:text-lg shrink-0 whitespace-nowrap h-full flex items-center">{t('app.title')}</Link>
          {/* Mobile: order 2 (center). Desktop: natural */}
          <form onSubmit={handleSearch} className="order-2 md:order-none flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4">
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
          {/* Hamburger: mobile only, order 1 (left). EN = open from left, FA = open from right */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="order-1 md:order-none md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            aria-label={t('app.menu')}
            aria-expanded={menuOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 text-xs sm:text-sm shrink-0">
            <NavLink to="/" className={({ isActive }) => `${isActive ? 'font-medium' : ''}`}>{t('app.home')}</NavLink>
            {!isAuthenticated && (
              <div className="flex items-center h-full gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 flex-row">
                <NavLink to="/login" className={({ isActive }) => `whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('app.login')}</NavLink>
                <NavLink to="/register" className={({ isActive }) => `whitespace-nowrap h-full flex items-center ${isActive ? 'font-medium' : ''}`}>{t('app.register')}</NavLink>
              </div>
            )}
            {isAuthenticated && (
              <>
                <NavLink to="/bookmarks" className={({ isActive }) => `whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('bookmarks.title')}</NavLink>
                <div className="relative group">
                  <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                    {t('app.lists')} ▾
                  </button>
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <NavLink to="/lists/watchlist" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('lists.watchlist')}</NavLink>
                    <NavLink to="/lists/favorites" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('lists.favorites')}</NavLink>
                    <NavLink to="/lists/watched" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('lists.watched')}</NavLink>
                  </div>
                </div>
                <NavLink to="/recommendations" className={({ isActive }) => `whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>{t('app.recommendations')}</NavLink>
                <div className="relative group">
                  <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap">
                    {t('app.profile')} ▾
                  </button>
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <NavLink to="/profile" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">{t('profile.title')}</NavLink>
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

      {/* Mobile menu: EN = slides from left, FA = slides from right */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <aside
            className={`fixed top-0 bottom-0 w-72 max-w-[85vw] z-50 md:hidden bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl transition-transform duration-300 ease-out ${
              language === 'fa' ? 'right-0 border-l' : 'left-0 border-r'
            } ${panelVisible ? 'translate-x-0' : language === 'fa' ? 'translate-x-full' : '-translate-x-full'}`}
            aria-label={t('app.menu')}
          >
            <div className="flex flex-col h-full">
              <div className={`flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 ${language === 'fa' ? 'flex-row-reverse' : ''}`}>
                <span className="font-semibold">{t('app.title')}</span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  aria-label={t('app.close_menu')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col flex-1 overflow-y-auto p-4 gap-1">
                <NavLink to="/" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                  {t('app.home')}
                </NavLink>
                {!isAuthenticated ? (
                  <>
                    <NavLink to="/login" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('app.login')}
                    </NavLink>
                    <NavLink to="/register" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('app.register')}
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/bookmarks" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('bookmarks.title')}
                    </NavLink>
                    <NavLink to="/lists/watchlist" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('lists.watchlist')}
                    </NavLink>
                    <NavLink to="/lists/favorites" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('lists.favorites')}
                    </NavLink>
                    <NavLink to="/lists/watched" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('lists.watched')}
                    </NavLink>
                    <NavLink to="/recommendations" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('app.recommendations')}
                    </NavLink>
                    <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {t('profile.title')}
                    </NavLink>
                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-2" />
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false);
                        await logoutReq();
                        toast.success(t('auth.logout'));
                        navigate('/');
                      }}
                      className={`px-3 py-2.5 rounded-lg text-sm w-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 ${language === 'fa' ? 'text-right' : 'text-left'}`}
                    >
                      {t('auth.logout')}
                    </button>
                  </>
                )}
                <div className="border-t border-zinc-200 dark:border-zinc-800 mt-auto pt-4 flex flex-col gap-3">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 px-1">{t('app.theme')}</label>
                  <select
                    aria-label={t('app.theme')}
                    className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  >
                    <option value="light">☀️ {t('app.light')}</option>
                    <option value="dark">🌙 {t('app.dark')}</option>
                  </select>
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 px-1">{t('app.language')}</label>
                  <select
                    aria-label={t('app.language')}
                    className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg px-3 py-2 text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'fa')}
                  >
                    <option value="en">EN</option>
                    <option value="fa">فا</option>
                  </select>
                </div>
              </nav>
            </div>
          </aside>
        </>
      )}

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


