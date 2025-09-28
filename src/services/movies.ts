import api from './api';

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

export async function fetchCategory(category: CategoryKey, page = 1) {
  const apiPath = categoryPathMap[category];
  const { data } = await api.get<MoviesResponse>(`/movies/${apiPath}`, { params: { page } });
  return data;
}

export type SearchFilters = {
  query: string;
  genre?: string;
  year?: number;
  minRating?: number;
  sortBy?: 'popularity' | 'release_date' | 'vote_average' | 'title';
  sortOrder?: 'asc' | 'desc';
};

export async function searchMovies(filters: SearchFilters, page = 1) {
  const params: Record<string, any> = {
    q: filters.query, // Use 'q' instead of 'query' as per Postman collection
    page,
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
  
  const { data } = await api.get<MoviesResponse>('/movies/search', { params });
  return data;
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

export async function fetchGenres() {
  try {
    const { data } = await api.get<{ genres: Genre[] }>('/movies/genres');
    return data.genres;
  } catch (error) {
    // Fallback to hardcoded genres if API fails
    console.warn('Genres API failed, using fallback genres:', error);
    return GENRES;
  }
}


