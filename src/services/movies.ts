import api from './api';
import { useUiStore } from '@/stores/useUiStore';

export type Movie = {
  id: number;
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  overview?: string;
  genreIds?: number[];
  adult?: boolean;
  originalLanguage?: string;
  popularity?: number;
};

export type MoviesResponse = {
  page: number;
  totalPages: number;
  results: Movie[];
};

export type CategoryKey = 'trending' | 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

// Map frontend category keys to backend API paths
const categoryPathMap: Record<CategoryKey, string> = {
  trending: 'trending',
  popular: 'popular',
  top_rated: 'top-rated',
  now_playing: 'now-playing',
  upcoming: 'upcoming'
};

export async function fetchCategory(category: CategoryKey, page = 1, lang?: string) {
  const apiPath = categoryPathMap[category];
  const currentLang = lang || useUiStore.getState().language;
  const { data } = await api.get(`/movies/${apiPath}`, { params: { page, lang: currentLang } });
  
  // Transform snake_case API response to camelCase frontend format
  return {
    page: data.page,
    totalPages: data.total_pages ?? data.totalPages,
    results: data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ?? movie.posterPath ?? null,
      releaseDate: movie.release_date ?? movie.releaseDate ?? null,
      voteAverage: movie.vote_average ?? movie.voteAverage ?? null,
      overview: movie.overview,
      genreIds: movie.genre_ids ?? movie.genreIds,
      adult: movie.adult,
      originalLanguage: movie.original_language ?? movie.originalLanguage,
      popularity: movie.popularity,
    }))
  };
}

export type SearchFilters = {
  query: string;
  genre?: string;
  year?: number;
  minRating?: number;
  sortBy?: 'popularity' | 'release_date' | 'vote_average' | 'title';
  sortOrder?: 'asc' | 'desc';
};

export async function searchMovies(filters: SearchFilters, page = 1, lang?: string) {
  const currentLang = lang || useUiStore.getState().language;
  const params: Record<string, any> = {
    q: filters.query, // Use 'q' instead of 'query' as per Postman collection
    page,
    lang: currentLang,
  };

  // Add optional filters with correct parameter names
  if (filters.genre) {
    params.with_genres = filters.genre; // Use 'with_genres' as per Postman collection
  }
  if (filters.year) {
    params.year = filters.year;
  }
  if (filters.minRating) {
    params.vote_average_gte = filters.minRating; // Use TMDB-style parameter
  }
  if (filters.sortBy && filters.sortOrder) {
    // Combine sort_by and sort_order as per Postman collection format
    params.sort_by = `${filters.sortBy}.${filters.sortOrder}`;
  } else if (filters.sortBy) {
    params.sort_by = `${filters.sortBy}.desc`; // Default to descending
  }
  
  const { data } = await api.get('/movies/search', { params });
  
  // Transform snake_case API response to camelCase frontend format
  return {
    page: data.page,
    totalPages: data.total_pages ?? data.totalPages,
    results: data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ?? movie.posterPath ?? null,
      releaseDate: movie.release_date ?? movie.releaseDate ?? null,
      voteAverage: movie.vote_average ?? movie.voteAverage ?? null,
      overview: movie.overview,
      genreIds: movie.genre_ids ?? movie.genreIds,
      adult: movie.adult,
      originalLanguage: movie.original_language ?? movie.originalLanguage,
      popularity: movie.popularity,
    }))
  };
}

export type Genre = {
  id: number;
  name: string;
};

// Hardcoded genres list as fallback since /movies/genres endpoint returns 500
const GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

export async function fetchGenres(lang?: string) {
  try {
    const currentLang = lang || useUiStore.getState().language;
    const { data } = await api.get<{ genres: Genre[] }>('/movies/genres', { params: { lang: currentLang } });
    return data.genres;
  } catch (error) {
    // Fallback to hardcoded genres if API fails
    console.warn('Genres API failed, using fallback genres:', error);
    return GENRES;
  }
}

// Movie Details Types
export type MovieDetails = Movie & {
  backdropPath?: string | null;
  genres?: Genre[];
  runtime?: number | null;
  budget?: number | null;
  revenue?: number | null;
  status?: string;
  tagline?: string;
  spokenLanguages?: { iso_639_1: string; name: string }[];
  productionCountries?: { iso_3166_1: string; name: string }[];
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath?: string | null;
};

export type CrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath?: string | null;
};

export type BookmarkStatus = {
  isBookmarked: boolean;
};

export type RatingResponse = {
  success: boolean;
  rating?: number;
};

// Fetch movie details
export async function fetchMovieDetails(tmdbId: string, lang?: string) {
  const currentLang = lang || useUiStore.getState().language;
  const { data } = await api.get(`/movies/${tmdbId}`, { params: { lang: currentLang } });
  
  // Transform snake_case API response to camelCase frontend format
  return {
    id: data.id,
    title: data.title,
    posterPath: data.poster_path ?? data.posterPath ?? null,
    backdropPath: data.backdrop_path ?? data.backdropPath ?? null,
    releaseDate: data.release_date ?? data.releaseDate ?? null,
    voteAverage: data.vote_average ?? data.voteAverage ?? null,
    overview: data.overview,
    genreIds: data.genre_ids ?? data.genreIds,
    genres: data.genres,
    adult: data.adult,
    originalLanguage: data.original_language ?? data.originalLanguage,
    popularity: data.popularity,
    runtime: data.runtime,
    budget: data.budget,
    revenue: data.revenue,
    status: data.status,
    tagline: data.tagline,
    spokenLanguages: data.spoken_languages ?? data.spokenLanguages,
    productionCountries: data.production_countries ?? data.productionCountries,
    credits: data.credits
  } as MovieDetails;
}

// Fetch similar movies
export async function fetchSimilarMovies(tmdbId: string, page = 1, lang?: string) {
  const currentLang = lang || useUiStore.getState().language;
  const { data } = await api.get(`/movies/${tmdbId}/similar`, { params: { page, lang: currentLang } });
  
  // Transform snake_case API response to camelCase frontend format
  return {
    page: data.page,
    totalPages: data.total_pages ?? data.totalPages,
    results: data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path ?? movie.posterPath ?? null,
      releaseDate: movie.release_date ?? movie.releaseDate ?? null,
      voteAverage: movie.vote_average ?? movie.voteAverage ?? null,
      overview: movie.overview,
      genreIds: movie.genre_ids ?? movie.genreIds,
      adult: movie.adult,
      originalLanguage: movie.original_language ?? movie.originalLanguage,
      popularity: movie.popularity,
    }))
  };
}

// Check bookmark status (protected)
export async function fetchBookmarkStatus(tmdbId: string) {
  const { data } = await api.get(`/movies/${tmdbId}/bookmark-status`);
  return data as BookmarkStatus;
}

// Bookmark a movie (protected)
export async function bookmarkMovie(tmdbId: string, movieData: { title: string; posterPath?: string | null; releaseDate?: string | null }) {
  const { data } = await api.post(`/movies/${tmdbId}/bookmark`, movieData);
  return data;
}

// Unbookmark a movie (protected)
export async function unbookmarkMovie(tmdbId: string) {
  const { data } = await api.post(`/movies/${tmdbId}/unbookmark`);
  return data;
}

// Rate a movie (protected)
export async function rateMovie(tmdbId: string, rating: number) {
  const { data } = await api.post(`/movies/${tmdbId}/rating`, { rating });
  return data as RatingResponse;
}

// Bookmarks API
export type Bookmark = {
  id: string;
  tmdbId: number;
  movieTitle: string;
  moviePosterPath?: string | null;
  movieReleaseDate?: string | null;
  createdAt: string;
};

export type BookmarksResponse = {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Fetch user bookmarks (protected)
export async function fetchBookmarks(page = 1, limit = 20) {
  const { data } = await api.get('/movies/bookmarks', { params: { page, limit } });
  return data as BookmarksResponse;
}


