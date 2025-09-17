import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './theme/ThemeProvider.tsx';
import { LanguageProvider } from './i18n/LanguageProvider.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';
import { ProtectedRoute } from './routes/ProtectedRoute.tsx';
import { queryClient } from './api/client.ts';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* Dashboard routes */}
                  <Route path="/" element={<div>Dashboard</div>} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
