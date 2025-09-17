import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from './AuthPage'
import { LanguageProvider } from '../i18n/LanguageProvider'
import '../i18n/i18n'
import { MemoryRouter } from 'react-router-dom'
import * as client from '../api/client'
import { useAuthStore } from '../store/auth'

vi.mock('../api/client', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    AuthAPI: {
      login: vi.fn(async () => ({ accessToken: 'a', refreshToken: 'r' })),
      register: vi.fn(async () => ({ accessToken: 'a', refreshToken: 'r' })),
    },
  }
})

function renderAuth() {
  return render(
    <MemoryRouter initialEntries={["/auth"]}>
      <LanguageProvider>
        <AuthPage />
      </LanguageProvider>
    </MemoryRouter>
  )
}

describe('AuthPage', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    localStorage.clear()
  })

  it('validates inputs and submits login', async () => {
    renderAuth()
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(client.AuthAPI.login).toHaveBeenCalled())
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('switches to register tab and submits', async () => {
    renderAuth()
    await userEvent.click(screen.getByRole('tab', { name: /register/i }))
    await userEvent.type(screen.getByLabelText(/email/i), 'user2@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(client.AuthAPI.register).toHaveBeenCalled())
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
})


