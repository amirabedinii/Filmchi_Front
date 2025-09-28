import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './shared/AppLayout';
import ProtectedRoute from './shared/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import MovieDetailsPage from './pages/MovieDetailsPage';

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
      {
        path: 'protected',
        element: <ProtectedRoute />,
        children: [
          // Future protected routes will go here
          // { path: 'profile', element: <ProfilePage /> },
          // { path: 'bookmarks', element: <BookmarksPage /> },
          // { path: 'recommendations', element: <RecommendationsPage /> }
        ]
      }
    ]
  }
]);

export default router;


