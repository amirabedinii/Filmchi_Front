import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '../store/auth'

function ProtectedContent() {
  return <div>protected</div>
}

function Auth() {
  return <div>auth</div>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('redirects to /auth when unauthenticated', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route index element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('auth')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthStore.getState().setTokens({ accessToken: 'a', refreshToken: 'r' })
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route index element={<ProtectedContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('protected')).toBeInTheDocument()
  })
})


