# Filmchi Frontend

**فارسی (Persian):** [README.fa.md](README.fa.md)

Filmchi is a React frontend for the Filmchi movie app: browse trending and category movies, search, view details, manage bookmarks and lists, and get AI-powered recommendations. It talks to the [Filmchi backend API](https://github.com/your-org/filmchi-back) for auth, movies, lists, and recommendations.

## Tech stack

- **React 18** + **TypeScript**
- **Vite** — build and dev server
- **React Router v6** — routing
- **Zustand** — global state (auth, UI)
- **TanStack Query** — server state and caching
- **i18next** — internationalization (English, Persian, RTL)
- **Tailwind CSS** — styling
- **Vitest** + **React Testing Library** — tests

## Project setup

```bash
npm install
# or
yarn install
```

## Environment

Create a `.env` (or `.env.local`) file with:

```
VITE_API_BASE_URL=http://localhost:3001
```

- Default is `http://localhost:3001` if not set. The backend must be running and CORS must allow this origin (e.g. `http://localhost:1700` for the Vite dev server).
- No other env vars are required for basic run; optional: `VITE_*` for feature flags or analytics if you add them later.

## Run the project

```bash
# development (dev server on port 1700)
npm run dev
# or
yarn dev

# production build
npm run build
# or
yarn build

# preview production build (e.g. port 1700)
npm run preview
# or
yarn preview
```

Open [http://localhost:1700](http://localhost:1700) in the browser.

## Run tests

```bash
npm run test
# or
yarn test

# Vitest UI (interactive)
yarn test:ui
```

Tests live in `src/__tests__/`. See [docs/Testing.md](docs/Testing.md) for the test strategy and inventory.

## Project structure

| Path | Description |
|------|-------------|
| `src/pages/` | Route-level pages (Home, Search, Login, Movie details, Bookmarks, Lists, Recommendations, Profile, Account, etc.) |
| `src/components/` | Reusable UI (e.g. `MovieCard`, `HorizontalScroll`) and `ui/` primitives (button, card, input, tabs, dialog, skeleton) |
| `src/services/` | API layer: `api.ts` (axios + interceptors), `auth.ts`, `movies.ts`, `lists.ts`, `recommendations.ts`, `users.ts`, `health.ts` |
| `src/stores/` | Zustand stores: `useAuthStore`, `useUiStore` |
| `src/shared/` | `AppLayout`, `ProtectedRoute` |
| `src/hooks/` | Custom hooks (e.g. `useDebounce`) |
| `src/i18n/` | i18next config and locale files (`en.json`, `fa.json`) |
| `src/router.tsx` | React Router v6 route definitions |
| `src/__tests__/` | Vitest + RTL tests |

## Main features

- **Auth:** Login, register, JWT (access + refresh). Tokens stored in localStorage; axios interceptor attaches Bearer and handles refresh on 401.
- **Home:** Carousels for trending, popular, top rated, now playing, upcoming; links to category and movie details.
- **Search:** Query from URL (`?q=...`), filters, pagination, genres.
- **Movie details:** Title, overview, similar movies, bookmark and rating (when logged in).
- **Bookmarks / Lists:** View and manage watchlist and watched list (and other list types the API supports).
- **Recommendations:** AI-powered suggestions (backend uses LLM + TMDB).
- **Profile / Account:** User profile and account settings.
- **i18n:** English and Persian; RTL layout when language is Persian.

## Documentation

All docs are available in **two versions**: English (`.md`) and Persian / فارسی (`.fa.md`, RTL).

| Doc | English | فارسی |
|-----|---------|--------|
| Design patterns | [docs/Design-Patterns.md](docs/Design-Patterns.md) | [docs/Design-Patterns.fa.md](docs/Design-Patterns.fa.md) |
| Testing | [docs/Testing.md](docs/Testing.md) | [docs/Testing.fa.md](docs/Testing.fa.md) |

## Troubleshooting

- **Blank page / CORS:** Ensure backend is running and `CORS_ORIGIN` (or equivalent) includes `http://localhost:1700` (or the origin you use). Check `VITE_API_BASE_URL`.
- **401 on requests:** Log in again; if refresh fails, clear localStorage (`filmchi_access_token`, `filmchi_refresh_token`) and log in.
- **Tests fail:** Run `yarn test` in a clean install; ensure `vitest.setup.ts` and `src/__tests__/` are present. If you added new mocks, ensure stores are reset in `beforeEach` where needed.

## License

MIT
