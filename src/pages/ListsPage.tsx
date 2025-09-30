import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useState } from 'react';
import { getList, addToList, removeFromList, type ListSortOption } from '@/services/lists';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, X, Plus, List, Settings, Search, SortAsc } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { searchMovies } from '@/services/movies';

const validListNames = ['watchlist', 'favorites', 'watched'];
const sortOptions: { value: ListSortOption; label: string }[] = [
  { value: 'addedAt:desc', label: 'Recently Added' },
  { value: 'addedAt:asc', label: 'Oldest First' },
  { value: 'title:asc', label: 'Title A-Z' },
  { value: 'title:desc', label: 'Title Z-A' },
];

export default function ListsPage() {
  const { listName } = useParams<{ listName: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [sortBy, setSortBy] = useState<ListSortOption>('addedAt:desc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Validate list name
  if (!listName || !validListNames.includes(listName)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('lists.invalid_list')}
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('lists.back_to_home')}
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch list items with infinite scroll
  const query = useInfiniteQuery({
    queryKey: ['list', listName, sortBy],
    queryFn: ({ pageParam = 1 }) => getList(listName, pageParam, 20, sortBy),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => {
      // Use the totalPages from the API response
      if (last.page >= last.totalPages) return undefined;
      return last.page + 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
  });

  const listItems = query.data?.pages.flatMap((p) => p.items) ?? [];
  const totalCount = query.data?.pages[0]?.total ?? 0;

  // Add to list mutation
  const addMutation = useMutation({
    mutationFn: (movie: { tmdbId: number; title: string; posterPath?: string | null }) => 
      addToList(listName!, movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', listName] });
      toast.success(t('lists.added_successfully'));
      setIsAddDialogOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    },
    onError: () => {
      toast.error(t('lists.add_failed'));
    },
  });

  // Remove from list mutation
  const removeMutation = useMutation({
    mutationFn: (tmdbId: number) => removeFromList(listName!, tmdbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', listName] });
      toast.success(t('lists.removed_successfully'));
    },
    onError: () => {
      toast.error(t('lists.remove_failed'));
    },
  });

  // Search movies for adding to list
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMovies({ query }, 1);
      setSearchResults(results.results.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      toast.error(t('lists.search_failed'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [t]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  // Load more results function
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const getListTitle = (name: string) => {
    const titles: Record<string, string> = {
      watchlist: t('lists.watchlist'),
      favorites: t('lists.favorites'),
      watched: t('lists.watched'),
    };
    return titles[name] || name;
  };

  const getListIcon = (name: string) => {
    switch (name) {
      case 'watchlist': return '📺';
      case 'favorites': return '❤️';
      case 'watched': return '✅';
      default: return '📋';
    }
  };

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
          {t('lists.back')}
        </button>
        
        {/* Title Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getListIcon(listName)}</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {getListTitle(listName)}
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('lists.description', { listName: getListTitle(listName) })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ListSortOption)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`lists.sort.${option.value.replace(':', '_')}`)}
                </option>
              ))}
            </select>

            {/* Add Movie Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('lists.add_movie')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('lists.add_movie_title')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-input">{t('lists.search_movies')}</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="search-input"
                        type="text"
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Search Results */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {isSearching ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">{t('lists.searching')}</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((movie) => (
                        <div
                          key={movie.id}
                          className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => addMutation.mutate({ 
                            tmdbId: movie.id, 
                            title: movie.title, 
                            posterPath: movie.posterPath 
                          })}
                        >
                          <img
                            src={movie.posterPath ? `https://image.tmdb.org/t/p/w92${movie.posterPath}` : '/placeholder-poster.jpg'}
                            alt={movie.title}
                            className="w-12 h-18 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {movie.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {movie.releaseDate?.split('-')[0]}
                            </p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                      ))
                    ) : searchQuery.trim() ? (
                      <p className="text-center text-gray-500 py-4">{t('lists.no_search_results')}</p>
                    ) : (
                      <p className="text-center text-gray-500 py-4">{t('lists.start_typing')}</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {query.isLoading ? (
            t('lists.loading')
          ) : query.isError ? (
            t('lists.error_loading')
          ) : (
            t('lists.total_count', { count: totalCount })
          )}
        </p>

        {/* List Items Grid */}
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
              <h3 className="text-lg font-medium">{t('lists.error_loading')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t('lists.error_description')}
              </p>
            </div>
            <button
              onClick={() => query.refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('lists.retry')}
            </button>
          </div>
        ) : listItems.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('lists.empty_title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('lists.empty_description')}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('lists.add_first_movie')}
            </Button>
          </div>
        ) : (
          // Results Grid
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {listItems.map((item) => (
                <div key={item.id} className="p-1 relative group">
                  <div className="[&>*]:!w-full">
                    <MovieCard 
                      movie={{
                        id: item.tmdbId,
                        title: item.title,
                        posterPath: item.posterPath,
                      }}
                    />
                  </div>
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeMutation.mutate(item.tmdbId);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    disabled={removeMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                  </button>
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
                  {query.isFetchingNextPage ? t('lists.loading_more') : t('lists.load_more')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
