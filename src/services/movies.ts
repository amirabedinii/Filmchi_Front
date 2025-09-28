import api from './api';

export type Movie = {
  id: number;
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
};

export type MoviesResponse = {
  page: number;
  totalPages: number;
  results: Movie[];
};

export type CategoryKey = 'trending' | 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

export async function fetchCategory(category: CategoryKey, page = 1) {
  const { data } = await api.get<MoviesResponse>(`/movies/${category}`, { params: { page } });
  return data;
}


