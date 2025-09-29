import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { fetchBookmarks } from '@/services/movies';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, X, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch bookmarks with infinite scroll
  const query = useInfiniteQuery({
    queryKey: ['bookmarks'],
    queryFn: ({ pageParam = 1 }) => fetchBookmarks(pageParam, 20),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      return last.page < last.total_pages ? last.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  });

  const bookmarks = query.data?.pages.flatMap((p) => p.results) ?? [];

  // Load more results function
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  // Auto-load more when user scrolls near the end
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

  if (!isAuthenticated) {
    return null;
  }

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
          {t('bookmarks.back')}
        </button>
        
        {/* Title Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('bookmarks.title')}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('bookmarks.description')}
          </p>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {query.isLoading ? (
            t('bookmarks.loading')
          ) : query.isError ? (
            t('bookmarks.error_loading')
          ) : (
            t('bookmarks.total_count', { count: query?.data?.pages[0]?.total_results ?? 0 })
          )}
        </p>

        {/* Bookmarks Grid */}
        {query.isLoading ? (
          // Loading State
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-1">
                <div className="animate-pulse">
                  <div className="aspect-[2/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          // Error State
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-2">
              <X className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t('bookmarks.error_loading')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t('bookmarks.error_description')}
              </p>
            </div>
            <button
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('bookmarks.retry')}
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('bookmarks.empty_title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('bookmarks.empty_description')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('bookmarks.browse_movies')}
            </button>
          </div>
        ) : (
          // Results Grid
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="p-1">
                  <div className="[&>*]:!w-full">
                    <MovieCard 
                      movie={{
                        id: bookmark.id,
                        title: bookmark.title,
                        posterPath: bookmark.poster_path,
                        releaseDate: bookmark.release_date,
                      }}
                    />
                  </div>
                </div>
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
                  {query.isFetchingNextPage ? t('bookmarks.loading_more') : t('bookmarks.load_more')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
