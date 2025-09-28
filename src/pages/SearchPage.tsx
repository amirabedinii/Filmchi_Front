import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { searchMovies, fetchGenres, type SearchFilters, type Genre } from '@/services/movies';
import MovieCard from '@/components/MovieCard';
import HorizontalScroll from '@/components/HorizontalScroll';

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Get search parameters from URL
  const query = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const minRating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
  const sortBy = (searchParams.get('sort') as SearchFilters['sortBy']) || 'popularity';
  const sortOrder = (searchParams.get('order') as SearchFilters['sortOrder']) || 'desc';

  // Local state for form inputs
  const [localQuery, setLocalQuery] = useState(query);
  const [localGenre, setLocalGenre] = useState(genre);
  const [localYear, setLocalYear] = useState(year?.toString() || '');
  const [localRating, setLocalRating] = useState(minRating?.toString() || '');
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('filmchi-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search to history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('filmchi-search-history', JSON.stringify(newHistory));
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('filmchi-search-history');
  };

  // Fetch genres for filter dropdown
  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: fetchGenres,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Build search filters
  const searchFilters = useMemo((): SearchFilters => ({
    query,
    ...(genre && { genre }),
    ...(year && { year }),
    ...(minRating && { minRating }),
    sortBy,
    sortOrder,
  }), [query, genre, year, minRating, sortBy, sortOrder]);

  // Search movies with infinite scroll
  const searchQuery = useInfiniteQuery({
    queryKey: ['search', searchFilters],
    queryFn: ({ pageParam = 1 }) => searchMovies(searchFilters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const movies = searchQuery.data?.pages.flatMap(p => p.results) ?? [];
  const totalResults = searchQuery.data?.pages[0]?.totalPages ? 
    searchQuery.data.pages[0].totalPages * 20 : 0; // Assuming 20 results per page

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;

    const newParams = new URLSearchParams();
    newParams.set('q', localQuery.trim());
    if (localGenre) newParams.set('genre', localGenre);
    if (localYear) newParams.set('year', localYear);
    if (localRating) newParams.set('rating', localRating);
    if (localSortBy !== 'popularity') newParams.set('sort', localSortBy);
    if (localSortOrder !== 'desc') newParams.set('order', localSortOrder);

    setSearchParams(newParams);
    saveToHistory(localQuery.trim());
    setShowFilters(false);
  };

  // Handle filter changes
  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (localGenre) newParams.set('genre', localGenre);
    if (localYear) newParams.set('year', localYear);
    if (localRating) newParams.set('rating', localRating);
    if (localSortBy !== 'popularity') newParams.set('sort', localSortBy);
    if (localSortOrder !== 'desc') newParams.set('order', localSortOrder);

    setSearchParams(newParams);
    setShowFilters(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalGenre('');
    setLocalYear('');
    setLocalRating('');
    setLocalSortBy('popularity');
    setLocalSortOrder('desc');
    
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    setSearchParams(newParams);
  };

  // Load more results
  const loadMore = () => {
    if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
      searchQuery.fetchNextPage();
    }
  };

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        searchQuery.hasNextPage &&
        !searchQuery.isFetchingNextPage
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchQuery.hasNextPage, searchQuery.isFetchingNextPage]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {query ? t('search.search_for') : t('search.title')}
          </h1>
          {query && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              "{query}" {totalResults > 0 && `(${t('search.results_count', { count: totalResults })})`}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {t('search.filters')}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!localQuery.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('search.title')}
        </button>
      </form>

      {/* Search History */}
      {!query && searchHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('search.search_history')}</h3>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('search.clear_history')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((historyQuery, index) => (
              <button
                key={index}
                onClick={() => {
                  setLocalQuery(historyQuery);
                  const newParams = new URLSearchParams();
                  newParams.set('q', historyQuery);
                  setSearchParams(newParams);
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {historyQuery}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.genre')}
              </label>
              <select
                value={localGenre}
                onChange={(e) => setLocalGenre(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('search.all_genres')}</option>
                {genres.map((genre: Genre) => (
                  <option key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.year')}
              </label>
              <input
                type="number"
                value={localYear}
                onChange={(e) => setLocalYear(e.target.value)}
                placeholder={t('search.any_year')}
                min="1900"
                max={new Date().getFullYear() + 5}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.rating')}
              </label>
              <input
                type="number"
                value={localRating}
                onChange={(e) => setLocalRating(e.target.value)}
                placeholder={t('search.any_rating')}
                min="0"
                max="10"
                step="0.1"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('search.sort_by')}
              </label>
              <select
                value={localSortBy}
                onChange={(e) => {
                  const value = e.target.value as SearchFilters['sortBy'] | undefined;
                  if (value) setLocalSortBy(value);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="popularity">{t('search.popularity')}</option>
                <option value="release_date">{t('search.release_date')}</option>
                <option value="vote_average">{t('search.vote_average')}</option>
                <option value="title">{t('search.title')}</option>
              </select>
            </div>
          </div>

          {/* Sort Order */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('search.sort_order')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="desc"
                  checked={localSortOrder === 'desc'}
                  onChange={(e) => setLocalSortOrder(e.target.value as 'desc')}
                  className="mr-2"
                />
                {t('search.desc')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="asc"
                  checked={localSortOrder === 'asc'}
                  onChange={(e) => setLocalSortOrder(e.target.value as 'asc')}
                  className="mr-2"
                />
                {t('search.asc')}
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('search.apply_filters')}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('search.clear_filters')}
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <div>
          {searchQuery.isLoading ? (
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
          ) : searchQuery.isError ? (
            // Error State
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-2">
                <X className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t('search.search_failed')}</h3>
              </div>
            </div>
          ) : movies.length === 0 ? (
            // No Results State
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('search.no_results')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('search.no_results_desc')}
              </p>
            </div>
          ) : (
            // Results Grid
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={{
                      id: movie.id,
                      title: movie.title,
                      posterPath: movie.posterPath,
                      releaseDate: movie.releaseDate,
                      voteAverage: movie.voteAverage,
                    }}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {searchQuery.hasNextPage && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={searchQuery.isFetchingNextPage}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {searchQuery.isFetchingNextPage ? t('search.searching') : t('home.load_more')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
