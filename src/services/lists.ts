import api from './api';

export type ListMovie = {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  addedAt: string;
};

export type ListSortOption = 'addedAt:desc' | 'addedAt:asc' | 'title:asc' | 'title:desc';

// Get movies from a specific list (protected)
export async function getList(listName: string, page = 1, limit = 50, sort: ListSortOption = 'addedAt:desc') {
  const { data } = await api.get(`/lists/${listName}`, {
    params: { page, limit, sort }
  });
  return data as ListMovie[];
}

// Add movie to a list (protected)
export async function addToList(listName: string, movie: { tmdbId: number; title: string }) {
  const { data } = await api.post(`/lists/${listName}`, movie);
  return data;
}

// Remove movie from a list (protected)
export async function removeFromList(listName: string, tmdbId: number) {
  const { data } = await api.delete(`/lists/${listName}/${tmdbId}`);
  return data;
}

// Convenience functions for common lists
export const watchlistAPI = {
  get: (page = 1, limit = 50, sort: ListSortOption = 'addedAt:desc') => 
    getList('watchlist', page, limit, sort),
  add: (movie: { tmdbId: number; title: string }) => 
    addToList('watchlist', movie),
  remove: (tmdbId: number) => 
    removeFromList('watchlist', tmdbId),
};

export const favoritesAPI = {
  get: (page = 1, limit = 50, sort: ListSortOption = 'addedAt:desc') => 
    getList('favorites', page, limit, sort),
  add: (movie: { tmdbId: number; title: string }) => 
    addToList('favorites', movie),
  remove: (tmdbId: number) => 
    removeFromList('favorites', tmdbId),
};

export const watchedAPI = {
  get: (page = 1, limit = 50, sort: ListSortOption = 'addedAt:desc') => 
    getList('watched', page, limit, sort),
  add: (movie: { tmdbId: number; title: string }) => 
    addToList('watched', movie),
  remove: (tmdbId: number) => 
    removeFromList('watched', tmdbId),
};
