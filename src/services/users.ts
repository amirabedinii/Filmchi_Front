import api from './api';

// User Profile Types
export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  favoriteGenres?: string[];
  favoriteDirectors?: string[];
  favoriteActors?: string[];
  createdAt: string;
  updatedAt?: string;
};

export type UserStats = {
  totalMoviesWatched: number;
  totalMoviesRated: number;
  totalBookmarks: number;
  totalWatchlistItems: number;
  averageRating: number;
  favoriteGenre?: string;
  totalWatchTime?: number; // in minutes
};

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fa';
  notifications: {
    email: boolean;
    push: boolean;
  };
  autoplay?: boolean;
  adultContent?: boolean;
};

export type UserPrivacy = {
  profileVisible: boolean;
  activityVisible: boolean;
  listsVisible: boolean;
};

export type UserActivity = {
  status: 'active' | 'inactive' | 'away';
  lastSeen?: string;
};

export type UserExportData = {
  profile: UserProfile;
  bookmarks: any[];
  watchlist: any[];
  ratings: any[];
  preferences: UserPreferences;
  privacy: UserPrivacy;
  exportedAt: string;
};

// Get user profile (protected)
export async function getUserProfile() {
  const { data } = await api.get('/users/profile');
  return data as UserProfile;
}

// Update user profile (protected)
export async function updateUserProfile(profile: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>>) {
  const { data } = await api.put('/users/profile', profile);
  return data as UserProfile;
}

// Get user statistics (protected)
export async function getUserStats() {
  const { data } = await api.get('/users/stats');
  return data as UserStats;
}

// Update user preferences (protected)
export async function updateUserPreferences(preferences: { preferences: UserPreferences }) {
  const { data } = await api.put('/users/preferences', preferences);
  return data;
}

// Update user privacy settings (protected)
export async function updateUserPrivacy(privacy: { privacy: UserPrivacy }) {
  const { data } = await api.put('/users/privacy', privacy);
  return data;
}

// Update user activity status (protected)
export async function updateUserActivity(activity: UserActivity) {
  const { data } = await api.put('/users/activity', activity);
  return data;
}

// Export user data (protected)
export async function exportUserData() {
  const { data } = await api.get('/users/export');
  return data as UserExportData;
}

// Delete user account (protected)
export async function deleteUserAccount() {
  const { data } = await api.delete('/users/account');
  return data;
}

// Convenience functions for common operations
export const userAPI = {
  profile: {
    get: getUserProfile,
    update: updateUserProfile,
  },
  stats: getUserStats,
  preferences: {
    update: updateUserPreferences,
  },
  privacy: {
    update: updateUserPrivacy,
  },
  activity: {
    update: updateUserActivity,
  },
  data: {
    export: exportUserData,
  },
  account: {
    delete: deleteUserAccount,
  },
};
