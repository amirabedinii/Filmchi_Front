import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './shared/AppLayout';
import ProtectedRoute from './shared/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import MovieCategoryPage from './pages/MovieCategoryPage';
import BookmarksPage from './pages/BookmarksPage';
import ListsPage from './pages/ListsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ProfilePage from './pages/ProfilePage';
// TODO: Uncomment when SettingsPage is ready to be used
// import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'movies/:id', element: <MovieDetailsPage /> },
      { path: 'movies/category/:category', element: <MovieCategoryPage /> },
      { path: 'bookmarks', element: <BookmarksPage /> },
      { path: 'lists/:listName', element: <ListsPage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      // TODO: Uncomment when SettingsPage is ready to be used
      // { path: 'settings', element: <SettingsPage /> },
      { path: 'account', element: <AccountPage /> },
      {
        path: 'protected',
        element: <ProtectedRoute />,
        children: [
          // Future protected routes will go here
        ]
      }
    ]
  }
]);

export default router;


