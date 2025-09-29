import api from './api';

export type Recommendation = {
  title: string;
  year: number;
  reason: string;
  tmdbId: number;
  posterPath?: string | null;
  overview: string;
};

export type RecommendationRequest = {
  query: string;
  language?: 'en' | 'fa';
};

// Get movie recommendations (protected)
export async function getRecommendations(request: RecommendationRequest) {
  const { data } = await api.post('/recommendations', {
    query: request.query,
    language: request.language || 'en'
  });
  return data as Recommendation[];
}

// Convenience functions for common recommendation queries
export const recommendationQueries = {
  similar: (movieTitle: string, language: 'en' | 'fa' = 'en') =>
    getRecommendations({ query: `movies similar to ${movieTitle}`, language }),
  
  byGenre: (genre: string, language: 'en' | 'fa' = 'en') =>
    getRecommendations({ query: `${genre} movies`, language }),
  
  byMood: (mood: string, language: 'en' | 'fa' = 'en') =>
    getRecommendations({ query: `${mood} movies`, language }),
  
  byDirector: (director: string, language: 'en' | 'fa' = 'en') =>
    getRecommendations({ query: `movies by ${director}`, language }),
  
  byActor: (actor: string, language: 'en' | 'fa' = 'en') =>
    getRecommendations({ query: `movies with ${actor}`, language }),
  
  custom: (query: string, language: 'en' | 'fa' = 'en') =>
    getRecommendations({ query, language }),
};
