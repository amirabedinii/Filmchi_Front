import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  fetchMovieDetails, 
  fetchSimilarMovies, 
  fetchBookmarkStatus, 
  bookmarkMovie, 
  unbookmarkMovie, 
  rateMovie,
  type MovieDetails 
} from '@/services/movies';
import { useAuthStore } from '@/stores/useAuthStore';
import { Star, Bookmark, BookmarkCheck, Calendar, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import HorizontalScroll from '@/components/HorizontalScroll';
import MovieCard from '@/components/MovieCard';

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  if (!id) {
    navigate('/');
    return null;
  }

  // Fetch movie details
  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch similar movies
  const { data: similarMovies } = useQuery({
    queryKey: ['movie', id, 'similar'],
    queryFn: () => fetchSimilarMovies(id),
    enabled: !!movie,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch bookmark status (only if authenticated)
  const { data: bookmarkStatus } = useQuery({
    queryKey: ['movie', id, 'bookmark'],
    queryFn: () => fetchBookmarkStatus(id),
    enabled: isAuthenticated && !!movie,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => {
      if (!movie) throw new Error('Movie not loaded');
      return bookmarkStatus?.isBookmarked 
        ? unbookmarkMovie(id)
        : bookmarkMovie(id, {
            title: movie.title,
            posterPath: movie.posterPath,
            releaseDate: movie.releaseDate
          });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', id, 'bookmark'] });
      toast.success(bookmarkStatus?.isBookmarked ? t('movie.unbookmarked') : t('movie.bookmarked'));
    },
    onError: () => {
      toast.error(t('movie.bookmark_error'));
    }
  });

  // Rating mutation
  const ratingMutation = useMutation({
    mutationFn: (rating: number) => rateMovie(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', id] });
      toast.success(t('movie.rated'));
    },
    onError: () => {
      toast.error(t('movie.rating_error'));
    }
  });

  const handleRating = (rating: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to rate movies');
      return;
    }
    setUserRating(rating);
    ratingMutation.mutate(rating);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}${t('movie.minutes')}`;
    }
    return `${mins} ${t('movie.minutes')}`;
  };

  const getDirectors = (movie: MovieDetails) => {
    return movie.credits?.crew?.filter(person => person.job === 'Director') || [];
  };

  const getMainCast = (movie: MovieDetails) => {
    return movie.credits?.cast?.slice(0, 10) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Hero section skeleton */}
        <div className="relative">
          <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-48 aspect-[2/3] bg-gray-300 dark:bg-gray-600 animate-pulse rounded-lg" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 animate-pulse rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 animate-pulse rounded w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content sections skeleton */}
        <div className="space-y-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-32" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <h3 className="text-lg font-medium">{t('movie.error')}</h3>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('app.home')}
        </button>
      </div>
    );
  }

  const backdropUrl = movie.backdropPath 
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;
  
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const rating = movie.voteAverage ? Math.round(movie.voteAverage * 10) / 10 : null;
  const directors = getDirectors(movie);
  const mainCast = getMainCast(movie);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero Section */}
      <div className="relative">
        {backdropUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        )}
        
        <div className={`${backdropUrl ? 'absolute bottom-6 left-6 right-6' : ''}`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="w-48 shrink-0">
              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-xl">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className={`flex-1 space-y-4 ${backdropUrl ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
                {movie.tagline && (
                  <p className={`text-lg italic ${backdropUrl ? 'text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{year}</span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                {rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{rating}/10</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        backdropUrl 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions (for authenticated users) */}
              {isAuthenticated && (
                <div className="flex items-center gap-4">
                  {/* Bookmark button */}
                  <button
                    onClick={() => bookmarkMutation.mutate()}
                    disabled={bookmarkMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      bookmarkStatus?.isBookmarked
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : backdropUrl
                        ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {bookmarkStatus?.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    {bookmarkStatus?.isBookmarked ? t('movie.unbookmark') : t('movie.bookmark')}
                  </button>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{t('movie.rate_movie')}:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star * 2)}
                          onMouseEnter={() => setHoveredRating(star * 2)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-colors"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              (hoveredRating || userRating) >= star * 2
                                ? 'fill-yellow-400 text-yellow-400'
                                : backdropUrl
                                ? 'text-white/60 hover:text-white'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Directors */}
              {directors.length > 0 && (
                <div>
                  <span className="font-medium">{t('movie.director')}: </span>
                  <span>{directors.map(d => d.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('movie.overview')}</h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {movie.overview || t('movie.no_overview')}
        </p>
      </section>

      {/* Additional Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movie.budget && movie.budget > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('movie.budget')}</h3>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(movie.budget)}
            </p>
          </div>
        )}

        {movie.revenue && movie.revenue > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('movie.revenue')}</h3>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(movie.revenue)}
            </p>
          </div>
        )}

        {movie.status && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('movie.status')}</h3>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{movie.status}</p>
          </div>
        )}
      </section>

      {/* Cast */}
      {mainCast.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('movie.cast')}</h2>
          <HorizontalScroll>
            {mainCast.map((person) => (
              <div key={person.id} className="w-32 shrink-0 text-center">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 mb-2">
                  {person.profilePath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">No Photo</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                  {person.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {person.character}
                </p>
              </div>
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Similar Movies */}
      {similarMovies && similarMovies.results.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('movie.similar')}</h2>
          <HorizontalScroll>
            {similarMovies.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </HorizontalScroll>
        </section>
      )}
    </div>
  );
}


