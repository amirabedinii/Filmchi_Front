import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { fetchCategoryWithFilters, type CategoryKey } from '@/services/movies';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/stores/useUiStore';

export default function MovieCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useUiStore();

  // Validate category
  const validCategories: CategoryKey[] = ['trending', 'popular', 'top_rated', 'now_playing', 'upcoming'];
  if (!category || !validCategories.includes(category as CategoryKey)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('category.invalid_category')}
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('category.back_to_home')}
          </button>
        </div>
      </div>
    );
  }

  const categoryKey = category as CategoryKey;

  // Fetch movies from API without filters
  const query = useInfiniteQuery({
    queryKey: ['movies', categoryKey, language],
    queryFn: ({ pageParam = 1 }) => fetchCategoryWithFilters(categoryKey, pageParam, {}, language),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      return last.page < last.totalPages ? last.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get all movies from API (already filtered and sorted server-side)
  const movies = query.data?.pages.flatMap((p) => p.results) ?? [];

  // Load more results function
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  // Auto-load more when user scrolls near the end with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          loadMore();
        }
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [query.hasNextPage, query.isFetchingNextPage, loadMore]);

  const getCategoryTitle = (key: CategoryKey) => {
    const titles = {
      trending: t('home.trending'),
      popular: t('home.popular'),
      top_rated: t('home.top_rated'),
      now_playing: t('home.now_playing'),
      upcoming: t('home.upcoming')
    };
    return titles[key];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('category.back')}
        </button>
        
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {getCategoryTitle(categoryKey)}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('category.page_description', { category: getCategoryTitle(categoryKey) })}
          </p>
        </div>
      </div>


      {/* Results */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {query.isLoading ? (
            t('category.loading_movies')
          ) : query.isError ? (
            t('category.error_loading')
          ) : (
            t('category.movies_found', { count: movies.length })
          )}
        </p>

        {/* Movie Grid */}
        {query.isLoading ? (
          // Loading State
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="mt-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          // Error State
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <X className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t('category.error_loading')}</h3>
            </div>
            <button
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('category.retry')}
            </button>
          </div>
        ) : movies.length === 0 ? (
          // No Results State
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('category.no_movies_found')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('category.no_movies_available')}
            </p>
          </div>
        ) : (
          // Results Grid
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Load More Button */}
            {query.hasNextPage && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={query.isFetchingNextPage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {query.isFetchingNextPage ? t('home.loading') : t('home.load_more')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
