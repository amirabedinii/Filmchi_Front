import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getRecommendations, type Recommendation } from '@/services/recommendations';
import { useUiStore } from '@/stores/useUiStore';
import { useAuthStore } from '@/stores/useAuthStore';
import MovieCard from '@/components/MovieCard';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Lightbulb, X } from 'lucide-react';

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useUiStore((s) => s.language);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const mutation = useMutation({
    mutationFn: (searchQuery: string) => getRecommendations({ query: searchQuery, language }),
    onSuccess: (data) => {
      setRecommendations(data);
      if (data.length === 0) {
        toast(t('recommendations.no_results'), { icon: '🤔' });
      } else {
        toast.success(t('recommendations.success'));
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('recommendations.error'));
      setRecommendations([]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(t('recommendations.login_required'));
      navigate('/login');
      return;
    }
    if (!query.trim()) {
      toast.error(t('recommendations.query_required'));
      return;
    }
    mutation.mutate(query.trim());
  };

  const exampleQueries = [
    t('recommendations.example_1'),
    t('recommendations.example_2'),
    t('recommendations.example_3'),
    t('recommendations.example_4'),
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
    if (isAuthenticated) {
      mutation.mutate(example);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('recommendations.back')}
        </button>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('recommendations.title')}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('recommendations.description')}
          </p>
        </div>
      </div>

      {/* Query Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('recommendations.query_label')}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('recommendations.query_placeholder')}
            className="w-full min-h-[100px] px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={mutation.isPending}
          />
          
          <button
            type="submit"
            disabled={mutation.isPending || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending
              ? t('recommendations.getting_recommendations')
              : t('recommendations.get_recommendations')}
          </button>
        </form>

        {/* Example Queries */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('recommendations.examples_title')}
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={mutation.isPending}
                className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {mutation.isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {mutation.isError && !mutation.isPending && (
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <X className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">{t('recommendations.error')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('recommendations.error_description')}
            </p>
          </div>
          <button
            onClick={() => query.trim() && mutation.mutate(query.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            {t('recommendations.retry')}
          </button>
        </div>
      )}

      {/* Results */}
      {!mutation.isPending && recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('recommendations.results_title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recommendations.length} {recommendations.length === 1 ? 'movie' : 'movies'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {recommendations.map((rec) => (
              <div key={rec.tmdbId} className="space-y-3">
                <MovieCard
                  movie={{
                    id: rec.tmdbId,
                    title: rec.title,
                    posterPath: rec.posterPath || null,
                    releaseDate: rec.year.toString(),
                    voteAverage: 0,
                    overview: rec.overview,
                  }}
                />
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    {t('recommendations.reason_label')}
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    {rec.reason}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    {t('recommendations.year_label')} {rec.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results State */}
      {!mutation.isPending &&
        !mutation.isError &&
        recommendations.length === 0 &&
        mutation.isSuccess && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('recommendations.no_results')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('recommendations.no_results_description')}
            </p>
          </div>
        )}
    </div>
  );
}
