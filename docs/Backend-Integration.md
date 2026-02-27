# Backend Integration

**فارسی (Persian):** [یکپارچه‌سازی بک‌اند](Backend-Integration.fa.md)

---

This document describes how the Filmchi frontend integrates with the backend API: environment configuration, the shared HTTP client, authentication, and the main service modules and endpoints.

---

## 1. Environment Configuration

The frontend talks to the backend using a single base URL configured via environment variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes (for production) | Base URL of the backend API. Must end with `/` (e.g. `https://api.example.com/`). Defaults to `http://localhost:3001/` when unset. |

Create a `.env` or `.env.local` in the project root:

```env
VITE_API_BASE_URL=http://localhost:3001/
```

All API requests use this base URL. Only `VITE_*` variables are exposed to the client; do not put secrets in frontend env.

---

## 2. Central API Client

**File:** `src/services/api.ts`

A single **axios instance** is used for all backend requests.

- **baseURL:** From `import.meta.env.VITE_API_BASE_URL` or `http://localhost:3001/`
- **timeout:** 15 seconds
- **withCredentials:** `false` (Bearer token is sent in headers instead of cookies)

### Request interceptor

- **Authorization:** If the user is logged in, `Authorization: Bearer <accessToken>` is added from `useAuthStore.getState().tokens.accessToken`.
- **Language:** For URLs containing `/movies` or `/recommendations`, a `lang` query parameter is added from `useUiStore.getState().language` when not already present, so the backend can return localized content.

### Response interceptor (401 handling)

- On **401 Unauthorized**, the client tries to refresh the access token:
  1. Calls `POST /auth/refresh` with `{ refreshToken }` (using the env base URL).
  2. On success, stores the new `accessToken` (and keeps `refreshToken`) via `useAuthStore.getState().setTokens`, then retries the original request with the new token.
  3. If refresh fails or there is no refresh token, the user is logged out via `useAuthStore.getState().logout()` and the error is rethrown.
- Concurrent requests that receive 401 wait for the single refresh; after refresh, they are retried with the new token.

---

## 3. Authentication

**File:** `src/services/auth.ts`

Tokens and user state are stored in **Zustand** (`useAuthStore`) and in **localStorage** (`filmchi_access_token`, `filmchi_refresh_token`). The API client reads tokens from the store and injects them into requests.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Body: `{ email, password }`. Returns `accessToken`, `refreshToken`, optional `user`. Store updates automatically. |
| `/auth/register` | POST | Body: `{ email, password }`. Same response as login; store updated automatically. |
| `/auth/logout` | POST | Body: `{ refreshToken }`. Optional server-side invalidation; frontend always clears tokens and user via `logout()`. |
| `/auth/refresh` | POST | Body: `{ refreshToken }`. Returns new `accessToken`. Used by the API client interceptor; not called directly by app code. |

After login or register, the app uses the returned tokens; no separate “get profile” call is required for basic auth state. Protected routes and API calls rely on the same store and interceptor.

---

## 4. Movies & Search

**File:** `src/services/movies.ts`

Movie data is fetched from the backend; responses are normalized to **camelCase** (e.g. `poster_path` → `posterPath`).

### Categories

| Frontend key | API path | Description |
|--------------|----------|-------------|
| `trending` | `/movies/trending` | Trending movies |
| `popular` | `/movies/popular` | Popular movies |
| `top_rated` | `/movies/top-rated` | Top rated |
| `now_playing` | `/movies/now-playing` | Now playing |
| `upcoming` | `/movies/upcoming` | Upcoming |

- **List:** `GET /movies/{path}?page=1&lang=en` (and optional `genre`, `year`, `sort_by` for filtered category).
- **Search:** `GET /movies/search?q=...&page=1&lang=en` with optional `with_genres`, `year`, `vote_average_gte`, `sort_by` (e.g. `popularity.desc`).

### Single movie

- **Details:** `GET /movies/:id?lang=en`
- **Similar:** `GET /movies/:id/similar?lang=en`

### Bookmarks (protected)

- **Status:** `GET /movies/:id/bookmark`
- **Add:** `POST /movies/:id/bookmark`
- **Remove:** `DELETE /movies/:id/bookmark`

### Genres

- **List:** `GET /movies/genres?lang=en` (fallback: hardcoded genre list in `movies.ts` if the endpoint fails).

All movie endpoints accept a `lang` query parameter; the API client can inject it from the UI language when not provided.

---

## 5. Lists (Watchlist, Favorites, Watched)

**File:** `src/services/lists.ts`

User lists are protected; the API client sends the Bearer token.

| Action | Method | Endpoint |
|--------|--------|----------|
| Get list | GET | `/lists/{listName}?page=1&limit=50&sort=addedAt:desc` |
| Add movie | POST | `/lists/{listName}` — body: `{ tmdbId, title, posterPath? }` |
| Remove movie | DELETE | `/lists/{listName}/{tmdbId}` |

`listName` is one of: `watchlist`, `favorites`, `watched`. Convenience helpers: `watchlistAPI`, `favoritesAPI`, `watchedAPI` (each with `get`, `add`, `remove`).

---

## 6. Recommendations

**File:** `src/services/recommendations.ts`

AI-powered recommendations; protected.

- **Generate:** `POST /recommendations` — body: `{ query, language?: 'en' | 'fa' }`. Timeout: 120 seconds.

Helper builders (e.g. `recommendationQueries.similar(movieTitle, language)`) build the request body; the service passes `language` through to the backend.

---

## 7. Users & Profile

**File:** `src/services/users.ts`

All user endpoints are protected.

| Purpose | Method | Endpoint |
|---------|--------|----------|
| Get profile | GET | `/users/profile` |
| Update profile | PUT | `/users/profile` |
| Get stats | GET | `/users/stats` |
| Update preferences | PUT | `/users/preferences` |
| Update privacy | PUT | `/users/privacy` |
| Update activity | PUT | `/users/activity` |
| Export data | GET | `/users/export` |
| Delete account | DELETE | `/users/account` |

Types (e.g. `UserProfile`, `UserStats`, `UserPreferences`) are defined in `users.ts`.

---

## 8. Health

**File:** `src/services/health.ts`

- **Check:** `GET /` — returns backend health (e.g. `status`, `message`, `timestamp`).
- **Test:** `testConnection()` wraps `checkHealth()` and returns `{ connected, status, message }` for connectivity checks.

---

## 9. Service Index

**File:** `src/services/index.ts`

Re-exports services for a single import path (e.g. `import { login, fetchCategory } from '@/services'`). Use either direct file imports or the index.

---

## 10. Error Handling

- **Auth errors:** 401 is handled by the API client (refresh or logout). Other auth errors (e.g. 400 on login) are left to the caller; pages typically use React Query or mutation callbacks and show messages via toast.
- **Validation:** Backend validation errors are usually in the response body (e.g. `message` or `errors`). The frontend displays them with `t()` for i18n where applicable.
- **Network / timeouts:** Axios timeout is 15s (120s for recommendations). Errors are surfaced to components; use error boundaries and toasts as needed.

For patterns (e.g. React Query usage, toast on error), see [Design-Patterns.md](Design-Patterns.md) and [Testing.md](Testing.md).
