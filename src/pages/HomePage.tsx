import { useTranslation } from 'react-i18next';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { fetchCategory, type CategoryKey } from '@/services/movies';
import HorizontalScroll from '@/components/HorizontalScroll';
import MovieCard from '@/components/MovieCard';

export default function HomePage() {
  const { t } = useTranslation();
  const sections: { key: CategoryKey; title: string }[] = [
    { key: 'trending', title: t('home.trending') },
    { key: 'popular', title: t('home.popular') },
    { key: 'top_rated', title: t('home.top_rated') },
    { key: 'now_playing', title: t('home.now_playing') },
    { key: 'upcoming', title: t('home.upcoming') }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('app.title')}</h1>
      {sections.map(({ key, title }) => (
        <CategoryRow key={key} category={key} title={title} />
      ))}
    </div>
  );
}

function CategoryRow({ category, title }: { category: CategoryKey; title: string }) {
  const { t } = useTranslation();
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  
  const query = useInfiniteQuery({
    queryKey: ['movies', category],
    queryFn: ({ pageParam = 1 }) => fetchCategory(category, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const movies = query.data?.pages.flatMap((p) => p.results) ?? [];

  // Auto-load more when user scrolls near the end
  useEffect(() => {
    const handleScroll = () => {
      if (!loadMoreRef.current || !query.hasNextPage || query.isFetchingNextPage) return;
      
      const rect = loadMoreRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200) {
        query.fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return (
    <section aria-label={title}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {query.hasNextPage && (
          <button
            ref={loadMoreRef}
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="text-sm px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {query.isFetchingNextPage ? t('home.loading') : t('home.load_more')}
          </button>
        )}
      </div>
      
      {query.isLoading ? (
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-36 sm:w-40 md:w-44 lg:w-48 shrink-0">
              <div className="aspect-[2/3] rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="mt-2">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-1" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {t('home.failed_to_load')}
        </div>
      ) : (
        <HorizontalScroll>
          {movies.map((m) => (
            <MovieCard key={m.id} movie={{
              id: m.id,
              title: m.title,
              posterPath: (m as any).poster_path ?? (m as any).posterPath ?? null,
              releaseDate: (m as any).release_date ?? (m as any).releaseDate ?? null,
              voteAverage: (m as any).vote_average ?? (m as any).voteAverage ?? null
            }} />
          ))}
        </HorizontalScroll>
      )}
    </section>
  );
}


