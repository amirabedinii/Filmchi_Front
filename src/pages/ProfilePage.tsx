import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { getUserProfile, updateUserProfile, getUserStats, UserProfile, UserStats } from '@/services/users';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUiStore } from '@/stores/useUiStore';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useUiStore((s) => s.language);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const [profileData, statsData] = await Promise.all([
        getUserProfile(),
        getUserStats()
      ]);
      setProfile(profileData);
      setStats(statsData);
      setEditedProfile({
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        avatarUrl: profileData.avatarUrl || '',
        favoriteGenres: profileData.favoriteGenres || [],
        favoriteDirectors: profileData.favoriteDirectors || [],
        favoriteActors: profileData.favoriteActors || []
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error(t('profile.error_loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await updateUserProfile({
        displayName: editedProfile.displayName,
        bio: editedProfile.bio,
        location: editedProfile.location,
        avatarUrl: editedProfile.avatarUrl,
        favoriteGenres: typeof editedProfile.favoriteGenres === 'string' 
          ? (editedProfile.favoriteGenres as string).split(',').map(g => g.trim()).filter(Boolean)
          : editedProfile.favoriteGenres,
        favoriteDirectors: typeof editedProfile.favoriteDirectors === 'string'
          ? (editedProfile.favoriteDirectors as string).split(',').map(d => d.trim()).filter(Boolean)
          : editedProfile.favoriteDirectors,
        favoriteActors: typeof editedProfile.favoriteActors === 'string'
          ? (editedProfile.favoriteActors as string).split(',').map(a => a.trim()).filter(Boolean)
          : editedProfile.favoriteActors
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success(t('profile.save_success'));
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error(t('profile.error_saving'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      avatarUrl: profile?.avatarUrl || '',
      favoriteGenres: profile?.favoriteGenres || [],
      favoriteDirectors: profile?.favoriteDirectors || [],
      favoriteActors: profile?.favoriteActors || []
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">{t('profile.error_loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label={t('profile.back')}
          >
            <ArrowLeft className={`w-5 h-5 ${language === 'fa' ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('profile.description')}</p>
          </div>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            {t('profile.edit_profile')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              {t('profile.cancel')}
            </Button>
            <Button onClick={handleSave} size="sm" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t('profile.saving') : t('profile.save_changes')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('profile.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="mt-1 bg-zinc-100 dark:bg-zinc-800"
              />
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="displayName">{t('profile.display_name')}</Label>
              <Input
                id="displayName"
                value={(isEditing ? editedProfile.displayName : profile.displayName) || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                placeholder={t('profile.display_name_placeholder')}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">{t('profile.bio')}</Label>
              <textarea
                id="bio"
                value={(isEditing ? editedProfile.bio : profile.bio) || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                placeholder={t('profile.bio_placeholder')}
                disabled={!isEditing}
                className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-md text-sm min-h-[100px] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">{t('profile.location')}</Label>
              <Input
                id="location"
                value={(isEditing ? editedProfile.location : profile.location) || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                placeholder={t('profile.location_placeholder')}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Favorite Genres */}
            <div>
              <Label htmlFor="favoriteGenres">{t('profile.favorite_genres')}</Label>
              <Input
                id="favoriteGenres"
                value={
                  isEditing 
                    ? (Array.isArray(editedProfile.favoriteGenres) 
                        ? editedProfile.favoriteGenres.join(', ') 
                        : editedProfile.favoriteGenres || '')
                    : (profile.favoriteGenres?.join(', ') || '')
                }
                onChange={(e) => setEditedProfile({ ...editedProfile, favoriteGenres: e.target.value as any })}
                placeholder={t('profile.favorite_genres_placeholder')}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Favorite Directors */}
            <div>
              <Label htmlFor="favoriteDirectors">{t('profile.favorite_directors')}</Label>
              <Input
                id="favoriteDirectors"
                value={
                  isEditing
                    ? (Array.isArray(editedProfile.favoriteDirectors)
                        ? editedProfile.favoriteDirectors.join(', ')
                        : editedProfile.favoriteDirectors || '')
                    : (profile.favoriteDirectors?.join(', ') || '')
                }
                onChange={(e) => setEditedProfile({ ...editedProfile, favoriteDirectors: e.target.value as any })}
                placeholder={t('profile.favorite_directors_placeholder')}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Favorite Actors */}
            <div>
              <Label htmlFor="favoriteActors">{t('profile.favorite_actors')}</Label>
              <Input
                id="favoriteActors"
                value={
                  isEditing
                    ? (Array.isArray(editedProfile.favoriteActors)
                        ? editedProfile.favoriteActors.join(', ')
                        : editedProfile.favoriteActors || '')
                    : (profile.favoriteActors?.join(', ') || '')
                }
                onChange={(e) => setEditedProfile({ ...editedProfile, favoriteActors: e.target.value as any })}
                placeholder={t('profile.favorite_actors_placeholder')}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Member Since */}
            <div>
              <Label>{t('profile.member_since')}</Label>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.user_stats')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats && (
              <>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.total_watched')}</span>
                  <span className="font-semibold">{stats.totalMoviesWatched}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.total_rated')}</span>
                  <span className="font-semibold">{stats.totalMoviesRated}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.total_bookmarks')}</span>
                  <span className="font-semibold">{stats.totalBookmarks}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.total_watchlist')}</span>
                  <span className="font-semibold">{stats.totalWatchlistItems}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.average_rating')}</span>
                  <span className="font-semibold">{stats.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>
                {stats.favoriteGenre && (
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.favorite_genre')}</span>
                    <span className="font-semibold">{stats.favoriteGenre}</span>
                  </div>
                )}
                {stats.totalWatchTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{t('stats.total_watch_time')}</span>
                    <span className="font-semibold">
                      {Math.floor(stats.totalWatchTime / 60)} {t('stats.hours')}
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
