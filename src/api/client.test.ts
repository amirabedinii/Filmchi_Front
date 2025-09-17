import { api, AuthAPI } from './client'
import { server, http, HttpResponse } from '../../vitest.setup'
import { useAuthStore } from '../store/auth'

describe('api client (msw)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('attaches Authorization header when token exists', async () => {
    useAuthStore.getState().setTokens({ accessToken: 'token123', refreshToken: 'r' })
    const handler = http.get('http://localhost:3001/test', async ({ request }) => {
      const auth = request.headers.get('authorization')
      if (auth === 'Bearer token123') return HttpResponse.json({ ok: true })
      return new HttpResponse(null, { status: 401 })
    })
    server.use(handler)
    const res = await api.get('/test')
    expect(res.data.ok).toBe(true)
  })

  it('refreshes token on 401 and retries', async () => {
    useAuthStore.getState().setTokens({ accessToken: 'old', refreshToken: 'refresh-me' })
    let call = 0
    server.use(
      // needs-auth: first call -> 401, second call -> requires new token
      http.get('http://localhost:3001/needs-auth', async ({ request }) => {
        call += 1
        if (call === 1) return new HttpResponse(null, { status: 401 })
        const auth = request.headers.get('authorization')
        if (auth === 'Bearer new') return HttpResponse.json({ ok: true })
        return new HttpResponse(null, { status: 401 })
      }),
      // Refresh endpoint
      http.post('http://localhost:3001/auth/refresh', async () =>
        HttpResponse.json({ accessToken: 'new', refreshToken: 'newr' })
      ),
    )
    const res = await api.get('/needs-auth')
    expect(res.data.ok).toBe(true)
    expect(useAuthStore.getState().accessToken).toBe('new')
  })

  it('AuthAPI calls correct endpoints', async () => {
    server.use(
      http.post('http://localhost:3001/auth/login', async () =>
        HttpResponse.json({ accessToken: 'a', refreshToken: 'r' })
      ),
      http.post('http://localhost:3001/auth/register', async () =>
        HttpResponse.json({ accessToken: 'a', refreshToken: 'r' })
      )
    )
    const login = await AuthAPI.login({ email: 'a', password: 'b' })
    expect(login.accessToken).toBe('a')
    const reg = await AuthAPI.register({ email: 'a', password: 'b' })
    expect(reg.refreshToken).toBe('r')
  })
})


