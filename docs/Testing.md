# Testing Strategy & Test Documentation

**فارسی (Persian):** [استراتژی تست و مستند تست](Testing.fa.md)

---

This document describes the **testing strategy** and **test inventory** for the Filmchi frontend application.

---

## 1. Stack & Setup

The project uses **Vitest** with **React Testing Library** and **jsdom** for unit and component tests.

- **Test runner:** Vitest (`vitest` in `package.json`).
- **Setup file:** `vitest.setup.ts` — extends Vitest with `@testing-library/jest-dom` matchers, runs `cleanup()` after each test, and defines a `window.matchMedia` polyfill for jsdom.
- **Test location:** `src/__tests__/` — all test files live here (e.g. `auth.test.tsx`, `routing.test.tsx`).

---

## 2. Test Commands (`package.json`)

| Command | Purpose |
|---------|---------|
| `npm run test` or `yarn test` | Run tests (Vitest). |
| `npm run test:ui` or `yarn test:ui` | Open Vitest UI (interactive). |

There is no separate `test:cov` script in the default `package.json`; you can add one with `vitest run --coverage` if needed.

---

## 3. Test Inventory & Scenarios

### 3.1 Test File Overview

| File | Module / Area | Description |
|------|----------------|-------------|
| `auth.test.tsx` | Auth | Login, register, redirect after auth, protected route redirect, logout and token clear. |
| `bookmarks.test.tsx` | Bookmarks | Bookmarks page behaviour (auth required), list and empty state. |
| `home.test.tsx` | Home | HomePage: category carousels, loading, pagination, navigation to movie details. |
| `homePageNavigation.test.tsx` | Home / Nav | Navigation from home to category and search. |
| `i18n.test.tsx` | i18n | Language switch to Persian, RTL (`dir="rtl"`) on document. |
| `lists.test.tsx` | Lists | Lists page: fetch list, add/remove items, auth. |
| `movieCategoryPage.test.tsx` | Movie category | Category page (e.g. trending): list and pagination. |
| `movieCategoryPageInvalid.test.tsx` | Movie category | Invalid category handling / error or redirect. |
| `movieDetails.test.tsx` | Movie details | Movie details page: title, overview, similar movies, bookmark. |
| `navbar.test.tsx` | Layout / Nav | Navbar: brand, home, login, register links. |
| `recommendations.test.tsx` | Recommendations | Recommendations page: form, submit, results (with mocked service). |
| `routing.test.tsx` | Routing | Routes render correct page: `/` → Home, `/login` → Login, `/register` → Register, `/movies/:id` → Movie details. |
| `search.test.tsx` | Search | Search page: query from URL, input, filters, results, pagination, genres. |
| `stores.test.ts` | Stores | Zustand: auth store (setTokens, logout), UI store (language, theme). |

### 3.2 Test Scenario Table (Summary)

| ID | Type | Module | Scenario | Priority |
|----|------|--------|----------|----------|
| T-01 | Component | Auth | Login success and redirect home | Critical |
| T-02 | Component | Auth | Register success and redirect home | Critical |
| T-03 | Component | Auth | Unauthenticated user redirected from protected route to /login | Critical |
| T-04 | Component | Auth | Authenticated user sees protected content | Critical |
| T-05 | Component | Auth | Logout clears tokens and shows login/register links | Critical |
| T-06 | Component | Routing | Home at /, Login at /login, Register at /register | High |
| T-07 | Component | Routing | Movie details at /movies/:id | High |
| T-08 | Unit | Stores | Auth store: setTokens, logout | High |
| T-09 | Unit | Stores | UI store: setLanguage, setTheme | High |
| T-10 | Component | Home | Category carousels, loading, pagination | High |
| T-11 | Component | Search | Search by query, filters, results, pagination | High |
| T-12 | Component | i18n | Switch to Persian and RTL | Medium |
| T-13 | Component | Navbar | Brand and nav links (home, login, register) | Medium |
| T-14 | Component | Movie details | Title, overview, similar, bookmark | Medium |
| T-15 | Component | Lists / Bookmarks / Recommendations | Page behaviour with mocked API | Medium |

### 3.3 Coverage Map (Conceptual)

```mermaid
flowchart LR
    Tests[Tests] --> Auth[Auth]
    Tests --> Routing[Routing]
    Tests --> Stores[Stores]
    Tests --> Pages[Pages]
    Tests --> i18n[i18n]
    
    subgraph "Critical"
    Auth --> Login[Login/Register]
    Auth --> Protected[Protected Route]
    Auth --> Logout[Logout]
    end
    
    subgraph "High"
    Routing --> Routes[Route Rendering]
    Stores --> AuthStore[Auth Store]
    Stores --> UiStore[UI Store]
    end
    
    subgraph "Pages"
    Pages --> Home[Home]
    Pages --> Search[Search]
    Pages --> MovieDetails[Movie Details]
    Pages --> Lists[Lists/Bookmarks/Recs]
    end
```

---

## 4. Testing Practices

- **Mocking:** Services (e.g. `@/services/auth`, `@/services/movies`) are mocked with `vi.mock()` so tests do not call the real API. Stores can be mocked or reset (e.g. `useAuthStore.getState().logout()` in `beforeEach`).
- **Routing:** `createMemoryRouter` from `react-router-dom` is used with the same route tree as the app (or a subset) and `initialEntries` to simulate navigation.
- **Providers:** Tests wrap the app (or page) in `QueryClientProvider` (TanStack Query) and often `RouterProvider`; auth tests also use `Toaster` where needed.
- **i18n:** Tests that check Persian/RTL use the real i18n instance (`../i18n` or `@/i18n`); others may mock or rely on default language.
- **Accessibility / Queries:** Prefer `getByRole`, `getByLabelText`, and `findBy*` for async content; tests support both English and Persian labels via regex (e.g. `/Login|ورود/i`).

---

## 5. Gaps & Recommendations

- **Coverage report:** Add a `test:cov` script (e.g. `vitest run --coverage`) and optionally enforce a minimum coverage in CI.
- **E2E:** No Playwright/Cypress E2E is referenced in the current setup; consider adding E2E for critical user flows (login → home → search → movie details).
- **API client:** The axios instance and interceptors (refresh token, retry) are not directly unit-tested; they are exercised indirectly via auth and page tests. Consider isolating interceptors for unit tests if behaviour becomes complex.

---

## 6. CI

The project includes `.github/workflows/ci.yml`; ensure the CI job runs `yarn test` (or `npm run test`) so all tests in `src/__tests__/` are executed on every push/PR.

---

When new features or pages are added, extend the test inventory above and add or update the corresponding test file in `src/__tests__/`.
