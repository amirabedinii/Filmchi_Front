import { buildUrl, fetchWithAuth } from './client';

export type Movie = {
  id: string;
  title: string;
  year?: number;
  posterUrl?: string;
};

export type PagedResult<T> = {
  items: T[];
  nextCursor?: string | null;
};

export const fetchUserList = async (
  listName: string,
  cursor?: string
): Promise<PagedResult<Movie>> => {
  const url = new URL(buildUrl(`/lists/${encodeURIComponent(listName)}`), window.location.origin);
  if (cursor) url.searchParams.set('cursor', cursor);
  const response = await fetchWithAuth(url.toString());
  if (!response.ok) throw new Error('Failed to load list');
  return response.json();
};

export const searchMovies = async (
  query: string,
  cursor?: string
): Promise<PagedResult<Movie>> => {
  const url = new URL(buildUrl('/movies/search'), window.location.origin);
  url.searchParams.set('q', query);
  if (cursor) url.searchParams.set('cursor', cursor);
  const response = await fetchWithAuth(url.toString());
  if (!response.ok) throw new Error('Search failed');
  return response.json();
};

export const addMovieToList = async (listName: string, movieId: string) => {
  const response = await fetchWithAuth(buildUrl(`/lists/${encodeURIComponent(listName)}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieId }),
  });
  if (!response.ok) throw new Error('Add failed');
  return response.json();
};

export const removeMovieFromList = async (listName: string, movieId: string) => {
  const response = await fetchWithAuth(buildUrl(`/lists/${encodeURIComponent(listName)}/${encodeURIComponent(movieId)}`), {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Remove failed');
  return response.json();
};


