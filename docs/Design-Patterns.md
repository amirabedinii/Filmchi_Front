# Design Patterns

**فارسی (Persian):** [دیزاین پترن‌ها](Design-Patterns.fa.md)

---

This document describes the **design patterns** used in the Filmchi frontend application (React + Vite), where they appear in the codebase, and how they support maintainability, testability, and user experience.

---

## Overview

The application is built with **React 18**, **Vite**, **React Router v6**, **Zustand**, and **TanStack Query**. The following patterns are used:

| Pattern | Purpose | Main location(s) |
|--------|---------|-------------------|
| **Service Layer** | Abstract API calls and business logic | `src/services/*.ts` |
| **Centralized API Client** | Single axios instance, auth & retry | `src/services/api.ts` |
| **Global State (Store)** | Auth and UI state | `src/stores/useAuthStore.ts`, `useUiStore.ts` |
| **Custom Hooks** | Reusable behaviour (e.g. debounce) | `src/hooks/useDebounce.ts` |
| **Layout + Outlet** | Shared shell and nested routes | `src/shared/AppLayout.tsx`, `src/router.tsx` |
| **Protected Route (Guard)** | Redirect unauthenticated users | `src/shared/ProtectedRoute.tsx` |
| **Page / Component split** | Pages as containers, UI in components | `src/pages/`, `src/components/` |
| **i18n** | Translations and RTL | `src/i18n/`, locale keys in pages |

---

## 1. Service Layer

**Intent:** Keep **API and data-fetching logic** in dedicated modules. Components and pages call service functions instead of using `fetch`/axios directly, which improves testability and consistency.

**In the project:**
- **Auth:** `src/services/auth.ts` — `login`, `register`, `logout`; tokens are then stored via `useAuthStore`.
- **Movies:** `src/services/movies.ts` — `fetchCategory`, `searchMovies`, `fetchMovieDetails`, `fetchSimilarMovies`, `fetchBookmarkStatus`, bookmark/rating actions; uses `api` (axios instance) and optionally `useUiStore.getState().language` for `lang`.
- **Lists:** `src/services/lists.ts` — get list, add to list, remove from list.
- **Recommendations:** `src/services/recommendations.ts` — generate recommendations.
- **Users:** `src/services/users.ts` — profile, preferences, etc.
- **Health:** `src/services/health.ts` — backend health check.

**Evidence:** Any `src/pages/*.tsx` or component that imports from `@/services/*` instead of `axios` directly.

---

## 2. Centralized API Client (Singleton + Interceptors)

**Intent:** One **axios instance** for all API calls, with request/response interceptors for auth (Bearer token, refresh on 401) and cross-cutting concerns (e.g. language param for movie endpoints).

**In the project:**
- `src/services/api.ts` creates the axios instance with `baseURL` from `VITE_API_BASE_URL`, timeout, and `withCredentials: false`.
- **Request interceptor:** Injects `Authorization: Bearer <accessToken>` from `useAuthStore.getState().tokens.accessToken`; for movie/recommendation endpoints injects `lang` from `useUiStore.getState().language` when not already in params.
- **Response interceptor:** On 401, attempts refresh using `refreshToken`; queues pending requests and retries them with the new access token; on refresh failure calls `logout()` and rejects.

**Evidence:** `src/services/api.ts`; all other services import `api` from it (e.g. `src/services/movies.ts`: `import api from './api'`).

---

## 3. Global State (Store Pattern with Zustand)

**Intent:** Hold **client-side global state** (auth, UI preferences) in predictable stores with a simple API. Components subscribe to slices to avoid unnecessary re-renders.

**In the project:**
- **Auth store** (`src/stores/useAuthStore.ts`): `isAuthenticated`, `user`, `tokens`, `setTokens`, `logout`, `setUser`. Tokens are persisted in `localStorage` (`filmchi_access_token`, `filmchi_refresh_token`). Used by `ProtectedRoute`, `AppLayout`, login/register pages, and the API client.
- **UI store** (`src/stores/useUiStore.ts`): `language`, `theme`, `setLanguage`, `setTheme`. Used by `AppLayout`, `api` interceptor, and movie services for `lang`.

**Evidence:** `src/stores/useAuthStore.ts`, `src/stores/useUiStore.ts`; usage in `ProtectedRoute`, `AppLayout`, `api.ts`, and pages.

---

## 4. Custom Hooks

**Intent:** Encapsulate **reusable stateful or side-effect logic** so components stay simple and the behaviour can be tested or reused.

**In the project:**
- `useDebounce<T>(value: T, delay: number): T` in `src/hooks/useDebounce.ts` — delays updates to `value` by `delay` ms. Used in `AppLayout` for the search input so navigation to `/search?q=...` happens after the user stops typing.

**Evidence:** `src/hooks/useDebounce.ts`; `src/shared/AppLayout.tsx` (e.g. `useDebounce(searchText, 500)`).

---

## 5. Layout + Outlet (Shell and Nested Routes)

**Intent:** Define a **shared shell** (header, nav, footer) and render child route content in a placeholder so layout code is not duplicated.

**In the project:**
- `src/router.tsx` uses `createBrowserRouter` with a root route whose `element` is `<AppLayout />`. All main routes are `children` of that route.
- `AppLayout` (`src/shared/AppLayout.tsx`) renders the header (brand, search, language/theme, auth links or user menu) and `<Outlet />` for the current child route (Home, Search, Login, Register, Movie details, Bookmarks, Lists, Recommendations, Profile, Account).

**Evidence:** `src/router.tsx`, `src/shared/AppLayout.tsx`.

---

## 6. Protected Route (Guard)

**Intent:** **Restrict access** to certain routes to authenticated users; redirect others to login (with optional `state.from` for post-login redirect).

**In the project:**
- `ProtectedRoute` (`src/shared/ProtectedRoute.tsx`) uses `useAuthStore((s) => s.isAuthenticated)`. If not authenticated, it renders `<Navigate to="/login" replace state={{ from: location }} />`; otherwise it renders `<Outlet />` for nested protected children.
- In `router.tsx`, a route with `path: 'protected'` uses `element: <ProtectedRoute />` and `children` for future protected sub-routes. Pages that require auth (e.g. Bookmarks, Lists, Recommendations) can be wrapped similarly or are already under layout that shows/hides nav based on auth.

**Evidence:** `src/shared/ProtectedRoute.tsx`, `src/router.tsx`; tests in `src/__tests__/auth.test.tsx`.

---

## 7. Page / Component Structure

**Intent:** **Pages** own route-level data (TanStack Query, store usage) and composition; **components** are presentational or small, reusable pieces (e.g. `MovieCard`, `HorizontalScroll`, UI primitives).

**In the project:**
- **Pages:** `src/pages/HomePage.tsx`, `SearchPage.tsx`, `MovieDetailsPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `BookmarksPage.tsx`, `ListsPage.tsx`, `RecommendationsPage.tsx`, `MovieCategoryPage.tsx`, `ProfilePage.tsx`, `AccountPage.tsx`, etc. They use services and stores and render layout + components.
- **Components:** `src/components/MovieCard.tsx`, `HorizontalScroll.tsx`, and `src/components/ui/*` (button, card, input, tabs, dialog, skeleton, etc.) — reusable and mostly presentational.

**Evidence:** Directory structure `src/pages/` vs `src/components/`; imports from `@/components/` and `@/services/` in pages.

---

## 8. Internationalization (i18n) and RTL

**Intent:** Support **multiple languages** (e.g. English, Persian) and **RTL** layout for right-to-left languages without duplicating markup.

**In the project:**
- `src/i18n/index.ts` configures `i18next` with `en` and `fa`, language detector, and react-i18next. Translation keys live in `src/i18n/locales/en.json` and `fa.json`.
- Pages and `AppLayout` use `useTranslation()` and `t('key')`. Language is stored in `useUiStore`; `AppLayout` calls `i18n.changeLanguage(language)` and sets `document.documentElement.dir` to `rtl` or `ltr` when language changes.

**Evidence:** `src/i18n/`, `src/shared/AppLayout.tsx`, `src/stores/useUiStore.ts`; tests in `src/__tests__/i18n.test.tsx`.

---

## Summary Table (with file references)

| Pattern | Key files |
|--------|-----------|
| Service Layer | `src/services/auth.ts`, `movies.ts`, `lists.ts`, `recommendations.ts`, `users.ts`, `health.ts` |
| Centralized API Client | `src/services/api.ts` |
| Global State (Stores) | `src/stores/useAuthStore.ts`, `src/stores/useUiStore.ts` |
| Custom Hooks | `src/hooks/useDebounce.ts` |
| Layout + Outlet | `src/router.tsx`, `src/shared/AppLayout.tsx` |
| Protected Route | `src/shared/ProtectedRoute.tsx` |
| Page / Component split | `src/pages/*.tsx`, `src/components/*.tsx`, `src/components/ui/*.tsx` |
| i18n & RTL | `src/i18n/index.ts`, `src/i18n/locales/*.json`, `AppLayout` + `useUiStore` |

---

When new patterns are introduced or existing ones refactored, this document should be updated accordingly.
