import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { LanguageProvider } from './i18n/LanguageProvider'
import './i18n/i18n'
import { AppThemeProvider } from './theme/ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/auth'
import { server, http, HttpResponse } from '../vitest.setup'

function renderWithProviders() {
  const queryClient = new QueryClient()
  return render(
    <LanguageProvider>
      <AppThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AppThemeProvider>
    </LanguageProvider>
  )
}

describe('App integration', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('redirects to auth when not logged in', () => {
    renderWithProviders()
    expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument()
  })

  it('navigates to dashboard after successful login', async () => {
    server.use(
      http.post('http://localhost:3001/auth/login', async () =>
        HttpResponse.json({ accessToken: 'a', refreshToken: 'r' })
      )
    )
    renderWithProviders()
    await (await screen.findByLabelText(/email/i)).focus()
    await (await screen.findByLabelText(/email/i)).ownerDocument?.defaultView?.Promise.resolve()
    const email = screen.getByLabelText(/email/i)
    const password = screen.getByLabelText(/password/i)
    await (await import('@testing-library/user-event')).default.type(email as HTMLInputElement, 'u@e.com')
    await (await import('@testing-library/user-event')).default.type(password as HTMLInputElement, '123456')
    await (await import('@testing-library/user-event')).default.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(screen.getByText(/dashboard/i)).toBeInTheDocument())
  })
})


