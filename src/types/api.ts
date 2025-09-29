// Common API Types
export type PaginatedResponse<T> = {
  results?: T[];
  data?: T[];
  page: number;
  totalPages: number;
  total?: number;
  totalResults?: number;
  limit?: number;
};

export type Language = 'en' | 'fa';

export type SortOrder = 'asc' | 'desc';

export type APIError = {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
};

// Re-export types from services for convenience
export type { Movie, MovieDetails, Genre, CastMember, CrewMember } from '../services/movies';
export type { UserProfile, UserStats, UserPreferences, UserPrivacy } from '../services/users';
export type { Recommendation } from '../services/recommendations';
export type { ListMovie } from '../services/lists';
export type { Bookmark } from '../services/movies';

// Global API configuration
export const API_CONFIG = {
  DEFAULT_LANGUAGE: 'en' as Language,
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_TIMEOUT: 15000,
  SUPPORTED_LANGUAGES: ['en', 'fa'] as const,
} as const;
