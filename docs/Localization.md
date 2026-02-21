# Localization (i18n)

**فارسی (Persian):** [محلی‌سازی (i18n)](Localization.fa.md)

---

This document describes how **internationalization (i18n)** and **localization** work in the Filmchi frontend: setup, translation keys, RTL support for Persian, and how to add or change translations.

---

## 1. Stack & Configuration

| Package | Purpose |
|---------|---------|
| **i18next** | Core i18n engine (language detection, interpolation, resource loading). |
| **react-i18next** | React bindings: `useTranslation()`, `Trans`, and integration with components. |
| **i18next-browser-languagedetector** | Optional detection; Filmchi prefers persisted choice in localStorage. |

**Config file:** `src/i18n/index.ts`

- **Resources:** Two locales: `en` (English) and `fa` (Persian). Translation JSON is in `src/i18n/locales/en.json` and `fa.json`.
- **Initial language:** Read from `localStorage.getItem('filmchi_lang')`; default `'en'` if missing.
- **Fallback:** `fallbackLng: 'en'` — missing keys in `fa` fall back to English.
- **Interpolation:** `escapeValue: false` — React already escapes; no double-escaping of HTML.

The app is bootstrapped with i18n (e.g. in `main.tsx` the root is wrapped so that `useTranslation` is available everywhere).

---

## 2. Locale Files & Key Structure

**Paths:** `src/i18n/locales/en.json`, `src/i18n/locales/fa.json`

Both files share the same **key structure**. Keys are nested by feature or area:

| Namespace (top-level key) | Usage |
|--------------------------|--------|
| `app` | App title, menu labels, home/login/register, language, theme, generic UI. |
| `auth` | Login/register form labels, placeholders, validation messages, success/error toasts. |
| `home` | Home page: category titles (trending, popular, etc.), load more, view all, loading/error. |
| `search` | Search page: title, placeholder, filters, sort options, history, results count, empty/error. |
| `movie` | Movie details: overview, similar, bookmark, rating, release date, etc. |
| `category` | Category page: title, pagination, loading, error. |
| `bookmarks` | Bookmarks page: title, empty state, actions. |
| `lists` | Lists: watchlist, favorites, watched, add/remove, empty states. |
| `recommendations` | AI recommendations: form, placeholder, submit, results, empty/error. |
| `profile` | Profile page: title, sections, edit. |
| `settings` | Settings page and options. |
| `account` | Account management: email, password change, danger zone. |
| `stats` | User statistics labels. |

**Example (en):**

```json
{
  "app": {
    "title": "Filmchi",
    "search_placeholder": "Search movies...",
    "login": "Login",
    "register": "Register",
    "home": "Home",
    "language": "Language",
    "theme": "Theme"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "login_success": "Logged in successfully.",
    "login_failed": "Login failed."
  }
}
```

**Interpolation:** Use `{{variable}}` in the JSON and pass an object as the second argument to `t()`:

```json
"results_count": "{{count}} results found"
```

```ts
t('search.results_count', { count: 42 })
```

---

## 3. Using Translations in Components

Use the **`useTranslation()`** hook from `react-i18next`:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <>
      <h1>{t('app.title')}</h1>
      <p>{t('search.results_count', { count: 10 })}</p>
    </>
  );
}
```

- **`t(key)`** — returns the string for the current language (with optional second argument for interpolation).
- **`i18n.changeLanguage(lang)`** — switches the active language; the UI store and document direction are kept in sync elsewhere (see below).

Use **dot notation** for nested keys: `t('auth.email')`, `t('home.trending')`, `t('movie.similar_movies')`.

---

## 4. Language State & RTL

The **UI language** is stored in **Zustand** and **localStorage**, and kept in sync with i18n and the document direction.

**Store:** `src/stores/useUiStore.ts`

- **State:** `language: 'en' | 'fa'`, `setLanguage(lang)`.
- **Persistence:** `localStorage.setItem('filmchi_lang', lang)` when language changes.
- **Initial load:** On app load, `document.documentElement.dir` is set from the stored language (`'rtl'` for `fa`, `'ltr'` for `en`), and the `dark` class is applied from theme if needed.

**Sync with i18n:** In `src/shared/AppLayout.tsx`, a `useEffect` runs when `language` (from `useUiStore`) changes:

- `i18n.changeLanguage(language)` — so all `t()` calls re-render with the new locale.
- `document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'` — so layout and tailwind RTL utilities (e.g. `rtl:` or logical properties) apply correctly.

When the user picks “Persian” in the UI, the app:

1. Calls `setLanguage('fa')` (store + localStorage).
2. The effect runs → i18n switches to `fa`, `dir` becomes `rtl`.
3. All components using `t()` show Persian; layout flips to RTL.

**RTL styling:** Use Tailwind’s RTL-aware utilities where needed (e.g. `ms-2`, `me-4`, or `rtl:...`) so spacing and alignment work in both directions. Test with `fa` selected to verify RTL.

---

## 5. Adding or Changing Translations

1. **Edit both locale files** — keep keys identical in `en.json` and `fa.json`; only the values differ.
2. **Add the key** under the right namespace (e.g. `search.no_results`).
3. **Use in code** — `t('search.no_results')` or with interpolation: `t('search.results_count', { count })`.

**Adding a new namespace:** Add a new top-level object in both JSON files (e.g. `"notifications": { "mark_read": "Mark as read" }`) and use `t('notifications.mark_read')`.

**Best practices:**

- Use short, consistent key names (e.g. `login_failed`, not `auth.loginFailedMessage` — we use snake_case in JSON).
- Reuse keys for the same concept (e.g. one “Loading...” for a given context) to avoid duplication.
- For dynamic or pluralized messages, use interpolation or i18next pluralization if you add it later.

---

## 6. Backend and Language

The UI language is sent to the backend where relevant:

- **API client:** For `/movies` and `/recommendations`, the shared axios client adds a `lang` query parameter from `useUiStore.getState().language` so the backend can return localized titles/overviews (e.g. from TMDB).
- **Recommendations:** The recommendations service accepts a `language` in the request body and passes it to the backend.

So changing the app language affects both the frontend strings (i18n) and the language of movie/recommendation content from the API. See [Backend-Integration.md](Backend-Integration.md) for details.

---

## 7. Summary

| Topic | Where / How |
|-------|--------------|
| Config | `src/i18n/index.ts` — resources, fallback, interpolation. |
| Locale files | `src/i18n/locales/en.json`, `fa.json` — same key structure. |
| In components | `useTranslation()` → `t('key')`, optional `t('key', { var })`. |
| Language state | `useUiStore`: `language`, `setLanguage`; persisted in `filmchi_lang`. |
| Sync & RTL | `AppLayout` effect: `i18n.changeLanguage(language)`, `document.documentElement.dir`. |
| Backend | API client and recommendations send `lang` / `language` from UI language. |

For design patterns that use i18n (e.g. layout, guards), see [Design-Patterns.md](Design-Patterns.md). For tests that assert language and RTL, see [Testing.md](Testing.md).
