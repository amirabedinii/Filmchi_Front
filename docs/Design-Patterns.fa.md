<div dir="rtl">

# دیزاین پترن‌ها

**English:** [Design Patterns](Design-Patterns.md)

---

این سند **دیزاین پترن‌های** به‌کاررفته در فرانت‌اند Filmchi (React + Vite) را شرح می‌دهد، محل استفادهٔ آن‌ها در کدبیس را نشان می‌دهد و توضیح می‌دهد چطور به قابلیت نگهداری، تست‌پذیری و تجربهٔ کاربری کمک می‌کنند.

---

## نمای کلی

اپلیکیشن با **React 18**، **Vite**، **React Router v6**، **Zustand** و **TanStack Query** ساخته شده. پترن‌های زیر در پروژه به کار رفته‌اند:

| پترن | هدف | محل اصلی استفاده |
|:-----|:----|:------------------|
| **لایه سرویس** | انتزاع فراخوانی API و منطق داده | `src/services/*.ts` |
| **کلاینت API متمرکز** | یک نمونه axios، احراز هویت و retry | `src/services/api.ts` |
| **استیت سراسری (استور)** | وضعیت احراز هویت و UI | `useAuthStore.ts`, `useUiStore.ts` |
| **هوک‌های سفارشی** | رفتار قابل استفاده مجدد (مثلاً debounce) | `src/hooks/useDebounce.ts` |
| **لایه‌بندی + Outlet** | پوستهٔ مشترک و مسیرهای تو در تو | `AppLayout.tsx`, `router.tsx` |
| **مسیر محافظت‌شده (Guard)** | هدایت کاربران غیر احراز هویت‌شده | `ProtectedRoute.tsx` |
| **جداسازی صفحه / کامپوننت** | صفحات به‌عنوان کانتینر، UI در کامپوننت‌ها | `src/pages/`, `src/components/` |
| **i18n** | ترجمه و RTL | `src/i18n/`، کلیدهای locale در صفحات |

---

## ۱. لایه سرویس

**هدف:** نگه داشتن **منطق API و واکشی داده** در ماژول‌های اختصاصی. کامپوننت‌ها و صفحات به‌جای استفادهٔ مستقیم از `fetch`/axios، توابع سرویس را فراخوانی می‌کنند تا تست‌پذیری و یکنواختی بهبود یابد.

**در پروژه:**
- **احراز هویت:** `src/services/auth.ts` — `login`, `register`, `logout`؛ توکن‌ها سپس از طریق `useAuthStore` ذخیره می‌شوند.
- **فیلم‌ها:** `src/services/movies.ts` — `fetchCategory`, `searchMovies`, `fetchMovieDetails`, `fetchSimilarMovies`, `fetchBookmarkStatus`، اکشن‌های بوکمارک/امتیاز؛ از `api` و در صورت نیاز `useUiStore.getState().language` برای `lang` استفاده می‌کند.
- **لیست‌ها:** `src/services/lists.ts` — دریافت لیست، افزودن به لیست، حذف از لیست.
- **پیشنهادها:** `src/services/recommendations.ts` — تولید پیشنهاد.
- **کاربران:** `src/services/users.ts` — پروفایل، ترجیحات و غیره.
- **سلامت:** `src/services/health.ts` — بررسی سلامت بک‌اند.

**شواهد:** هر `src/pages/*.tsx` یا کامپوننتی که از `@/services/*` ایمپورت می‌کند به‌جای axios مستقیم.

---

## ۲. کلاینت API متمرکز (Singleton + Interceptors)

**هدف:** یک **نمونه axios** برای همهٔ فراخوانی‌های API، با اینترسپتورهای request/response برای احراز هویت (Bearer، رفرش در ۴۰۱) و نگرانی‌های فرامرزی (مثلاً پارامتر زبان برای endpointهای فیلم).

**در پروژه:**
- `src/services/api.ts` نمونه axios را با `baseURL` از `VITE_API_BASE_URL`، timeout و `withCredentials: false` می‌سازد.
- **اینترسپتور درخواست:** `Authorization: Bearer <accessToken>` را از `useAuthStore.getState().tokens.accessToken` تزریق می‌کند؛ برای endpointهای فیلم/پیشنهاد در صورت نبودن در params، `lang` را از `useUiStore.getState().language` تزریق می‌کند.
- **اینترسپتور پاسخ:** در ۴۰۱، رفرش با `refreshToken` را امتحان می‌کند؛ درخواستهای معلق را در صف می‌گذارد و با توکن جدید دوباره اجرا می‌کند؛ در صورت شکست رفرش `logout()` را صدا می‌زند و reject می‌کند.

**شواهد:** `src/services/api.ts`؛ بقیهٔ سرویس‌ها `api` را از آن ایمپورت می‌کنند (مثلاً `src/services/movies.ts`: `import api from './api'`).

---

## ۳. استیت سراسری (پترن استور با Zustand)

**هدف:** نگه داشتن **استیت سراسری سمت کلاینت** (احراز هویت، ترجیحات UI) در استورهای قابل پیش‌بینی با API ساده. کامپوننت‌ها به sliceها subscribe می‌کنند تا از رندرهای غیرضروری جلوگیری شود.

**در پروژه:**
- **استور احراز هویت** (`src/stores/useAuthStore.ts`): `isAuthenticated`, `user`, `tokens`, `setTokens`, `logout`, `setUser`. توکن‌ها در `localStorage` (`filmchi_access_token`, `filmchi_refresh_token`) ذخیره می‌شوند. در `ProtectedRoute`, `AppLayout`، صفحات ورود/ثبت‌نام و کلاینت API استفاده می‌شود.
- **استور UI** (`src/stores/useUiStore.ts`): `language`, `theme`, `setLanguage`, `setTheme`. در `AppLayout`، اینترسپتور `api` و سرویس‌های فیلم برای `lang` استفاده می‌شود.

**شواهد:** `src/stores/useAuthStore.ts`, `src/stores/useUiStore.ts`؛ استفاده در `ProtectedRoute`, `AppLayout`, `api.ts` و صفحات.

---

## ۴. هوک‌های سفارشی

**هدف:** کپسوله کردن **منطق stateful یا side-effect قابل استفاده مجدد** تا کامپوننت‌ها ساده بمانند و رفتار قابل تست یا استفاده مجدد باشد.

**در پروژه:**
- `useDebounce<T>(value: T, delay: number): T` در `src/hooks/useDebounce.ts` — به‌تأخیر انداختن به‌روزرسانی `value` به‌مدت `delay` میلی‌ثانیه. در `AppLayout` برای ورودی جستجو استفاده می‌شود تا ناوبری به `/search?q=...` بعد از توقف تایپ کاربر انجام شود.

**شواهد:** `src/hooks/useDebounce.ts`؛ `src/shared/AppLayout.tsx` (مثلاً `useDebounce(searchText, 500)`).

---

## ۵. لایه‌بندی + Outlet (پوسته و مسیرهای تو در تو)

**هدف:** تعریف **پوستهٔ مشترک** (هدر، ناو، فوتر) و رندر کردن محتوای مسیر فرزند در یک placeholder تا کد لایه تکرار نشود.

**در پروژه:**
- `src/router.tsx` از `createBrowserRouter` با یک مسیر روت استفاده می‌کند که `element` آن `<AppLayout />` است. همهٔ مسیرهای اصلی `children` آن مسیر هستند.
- `AppLayout` (`src/shared/AppLayout.tsx`) هدر (برند، جستجو، زبان/تم، لینک‌های احراز هویت یا منوی کاربر) و `<Outlet />` را برای مسیر فرزند فعلی (خانه، جستجو، ورود، ثبت‌نام، جزئیات فیلم، بوکمارک‌ها، لیست‌ها، پیشنهادها، پروفایل، اکانت) رندر می‌کند.

**شواهد:** `src/router.tsx`, `src/shared/AppLayout.tsx`.

---

## ۶. مسیر محافظت‌شده (Guard)

**هدف:** **محدود کردن دسترسی** به برخی مسیرها به کاربران احراز هویت‌شده؛ هدایت بقیه به صفحهٔ ورود (با اختیار `state.from` برای ریدایرکت بعد از ورود).

**در پروژه:**
- `ProtectedRoute` (`src/shared/ProtectedRoute.tsx`) از `useAuthStore((s) => s.isAuthenticated)` استفاده می‌کند. در صورت عدم احراز هویت، `<Navigate to="/login" replace state={{ from: location }} />` رندر می‌کند؛ در غیر این صورت `<Outlet />` را برای فرزندان محافظت‌شده رندر می‌کند.
- در `router.tsx`، مسیری با `path: 'protected'` از `element: <ProtectedRoute />` و `children` برای زیرمسیرهای محافظت‌شدهٔ آینده استفاده می‌کند.

**شواهد:** `src/shared/ProtectedRoute.tsx`, `src/router.tsx`؛ تست‌ها در `src/__tests__/auth.test.tsx`.

---

## ۷. ساختار صفحه / کامپوننت

**هدف:** **صفحات** مالک دادهٔ سطح مسیر (TanStack Query، استفاده از استور) و ترکیب هستند؛ **کامپوننت‌ها** ارائه‌ای یا قطعات کوچک قابل استفاده مجدد هستند (مثلاً `MovieCard`, `HorizontalScroll`, اولیه‌های UI).

**در پروژه:**
- **صفحات:** `HomePage`, `SearchPage`, `MovieDetailsPage`, `LoginPage`, `RegisterPage`, `BookmarksPage`, `ListsPage`, `RecommendationsPage`, `MovieCategoryPage`, `ProfilePage`, `AccountPage` و غیره. از سرویس‌ها و استورها استفاده می‌کنند و لایه + کامپوننت رندر می‌کنند.
- **کامپوننت‌ها:** `MovieCard`, `HorizontalScroll` و `src/components/ui/*` (دکمه، کارت، ورودی، تب، دیالوگ، اسکلتون و غیره) — قابل استفاده مجدد و عمدتاً ارائه‌ای.

**شواهد:** ساختار پوشهٔ `src/pages/` در مقابل `src/components/`؛ ایمپورت از `@/components/` و `@/services/` در صفحات.

---

## ۸. بین‌المللی‌سازی (i18n) و RTL

**هدف:** پشتیبانی از **چند زبان** (مثلاً انگلیسی، فارسی) و **چیدمان RTL** برای زبان‌های راست به چپ بدون تکرار markup.

**در پروژه:**
- `src/i18n/index.ts` با `en` و `fa`، language detector و react-i18next پیکربندی می‌شود. کلیدهای ترجمه در `src/i18n/locales/en.json` و `fa.json` هستند.
- صفحات و `AppLayout` از `useTranslation()` و `t('key')` استفاده می‌کنند. زبان در `useUiStore` ذخیره می‌شود؛ `AppLayout` با تغییر زبان `i18n.changeLanguage(language)` را صدا می‌زند و `document.documentElement.dir` را روی `rtl` یا `ltr` تنظیم می‌کند.

**شواهد:** `src/i18n/`, `src/shared/AppLayout.tsx`, `src/stores/useUiStore.ts`؛ تست‌ها در `src/__tests__/i18n.test.tsx`.

---

## جدول خلاصه (با ارجاع فایل)

| پترن | فایل‌های کلیدی |
|:-----|:----------------|
| لایه سرویس | `src/services/auth.ts`, `movies.ts`, `lists.ts`, `recommendations.ts`, `users.ts`, `health.ts` |
| کلاینت API متمرکز | `src/services/api.ts` |
| استیت سراسری (استورها) | `src/stores/useAuthStore.ts`, `src/stores/useUiStore.ts` |
| هوک‌های سفارشی | `src/hooks/useDebounce.ts` |
| لایه‌بندی + Outlet | `src/router.tsx`, `src/shared/AppLayout.tsx` |
| مسیر محافظت‌شده | `src/shared/ProtectedRoute.tsx` |
| صفحه / کامپوننت | `src/pages/*.tsx`, `src/components/*.tsx`, `src/components/ui/*.tsx` |
| i18n و RTL | `src/i18n/index.ts`, `src/i18n/locales/*.json`, `AppLayout` + `useUiStore` |

---

با معرفی پترن‌های جدید یا بازنویسی پترن‌های موجود، این سند باید به‌روز شود.

</div>
