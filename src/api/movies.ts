import { buildUrl, fetchWithAuth } from './client';

export type Movie = {
  id: string;
  tmdbId: number;
  title: string;
  year?: number;
  posterUrl?: string;
  addedAt?: string;
};

export type RecommendedMovie = {
  title: string;
  reason: string;
  year: number;
  tmdbId: number;
  posterPath: string;
  overview: string;
};

export type PagedResult<T> = {
  items: T[];
  nextCursor?: string | null;
};

export const fetchUserList = async (
  listName: string,
  page?: number,
  limit: number = 20
): Promise<PagedResult<Movie>> => {
  const url = new URL(buildUrl(`/lists/${encodeURIComponent(listName)}`), window.location.origin);
  if (page) url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());
  const response = await fetchWithAuth(url.toString());
  if (!response.ok) throw new Error('Failed to load list');
  const data = await response.json();
  
  // Transform the response to match our expected format
  return {
    items: data.map((item: any) => ({
      id: item.id,
      tmdbId: item.tmdbId,
      title: item.title,
      year: item.year,
      posterUrl: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : undefined,
      addedAt: item.addedAt
    })),
    nextCursor: data.length === limit ? String((page || 1) + 1) : undefined
  };
};

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<PagedResult<Movie>> => {
  // Search directly via TMDB API as specified in Phase 2
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your_tmdb_api_key';
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Search failed');
  
  const data = await response.json();
  
  return {
    items: data.results.map((movie: any) => ({
      id: movie.id.toString(),
      tmdbId: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined
    })),
    nextCursor: data.page < data.total_pages ? String(page + 1) : undefined
  };
};

export const addMovieToList = async (listName: string, tmdbId: number, title: string) => {
  const response = await fetchWithAuth(buildUrl(`/lists/${encodeURIComponent(listName)}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tmdbId, title }),
  });
  if (!response.ok) throw new Error('Add failed');
  return response.json();
};

export const removeMovieFromList = async (listName: string, tmdbId: number) => {
  const response = await fetchWithAuth(buildUrl(`/lists/${encodeURIComponent(listName)}/${tmdbId}`), {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Remove failed');
  return response.json();
};

export const getRecommendations = async (query: string): Promise<RecommendedMovie[]> => {
  const response = await fetchWithAuth('http://localhost:3001/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  
  if (!response.ok) throw new Error('Recommendations failed');
  
  const data = await response.json();
  return data;
};


