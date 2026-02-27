<div dir="rtl">

# یکپارچه‌سازی بک‌اند

**English:** [Backend Integration](Backend-Integration.md)

---

این سند توضیح می‌دهد فرانت‌اند Filmchi چگونه با API بک‌اند یکپارچه می‌شود: تنظیمات محیط، کلاینت HTTP مشترک، احراز هویت، و ماژول‌ها و اندپوینت‌های اصلی سرویس.

---

## ۱. پیکربندی محیط

فرانت‌اند با یک آدرس پایه از طریق متغیرهای محیطی به بک‌اند متصل می‌شود.

| متغیر | الزامی | توضیح |
|--------:|--------:|--------:|
| `VITE_API_BASE_URL` | بله (برای پروداکشن) | آدرس پایه API بک‌اند. باید با `/` تمام شود (مثلاً `https://api.example.com/`). در صورت عدم تنظیم، پیش‌فرض `http://localhost:3001/` است. |

یک فایل `.env` یا `.env.local` در ریشه پروژه بسازید:

</div>

```env
VITE_API_BASE_URL=http://localhost:3001/
```

<div dir="rtl">

همه درخواست‌های API از این آدرس پایه استفاده می‌کنند. فقط متغیرهای `VITE_*` به کلاینت در دسترس هستند؛ رمزها را در env فرانت قرار ندهید.

---

## ۲. کلاینت API مرکزی

**فایل:** `src/services/api.ts`

یک **نمونه axios** برای همه درخواست‌های بک‌اند استفاده می‌شود.

- **baseURL:** از `import.meta.env.VITE_API_BASE_URL` یا `http://localhost:3001/`
- **timeout:** ۱۵ ثانیه
- **withCredentials:** `false` (توکن Bearer در هدر فرستاده می‌شود، نه کوکی)

### اینترسپتور درخواست

- **Authorization:** در صورت لاگین بودن کاربر، `Authorization: Bearer <accessToken>` از `useAuthStore.getState().tokens.accessToken` به هدر اضافه می‌شود.
- **زبان:** برای آدرس‌های حاوی `/movies` یا `/recommendations`، پارامتر کوئری `lang` از `useUiStore.getState().language` اضافه می‌شود (در صورت نبودن)، تا بک‌اند محتوای محلی‌سازی‌شده برگرداند.

### اینترسپتور پاسخ (مدیریت ۴۰۱)

- در **401 Unauthorized**، کلاینت تلاش به رفرش توکن می‌کند:
  1. `POST /auth/refresh` با `{ refreshToken }` (با استفاده از base URL env) فراخوانی می‌شود.
  2. در صورت موفقیت، `accessToken` جدید (و در صورت نیاز `refreshToken`) از طریق `useAuthStore.getState().setTokens` ذخیره و درخواست اولیه با توکن جدید دوباره ارسال می‌شود.
  3. در صورت شکست رفرش یا نبودن refresh token، کاربر با `useAuthStore.getState().logout()` از سیستم خارج و خطا دوباره پرتاب می‌شود.
- درخواست‌های همزمانی که ۴۰۱ می‌گیرند منتظر یک بار رفرش می‌مانند؛ پس از رفرش با توکن جدید دوباره ارسال می‌شوند.

---

## ۳. احراز هویت

**فایل:** `src/services/auth.ts`

توکن‌ها و وضعیت کاربر در **Zustand** (`useAuthStore`) و **localStorage** (`filmchi_access_token`, `filmchi_refresh_token`) ذخیره می‌شوند. کلاینت API توکن‌ها را از استور می‌خواند و در درخواست‌ها قرار می‌دهد.

| اندپوینت | متد | توضیح |
|----------:|-----:|--------:|
| `/auth/login` | POST | بدنه: `{ email, password }`. برمی‌گرداند: `accessToken`, `refreshToken`, و در صورت وجود `user`. استور به‌طور خودکار به‌روز می‌شود. |
| `/auth/register` | POST | بدنه: `{ email, password }`. پاسخ مانند login؛ استور به‌طور خودکار به‌روز می‌شود. |
| `/auth/logout` | POST | بدنه: `{ refreshToken }`. برای باطل‌سازی سمت سرور (اختیاری)؛ فرانت همیشه با `logout()` توکن‌ها و کاربر را پاک می‌کند. |
| `/auth/refresh` | POST | بدنه: `{ refreshToken }`. برمی‌گرداند: `accessToken` جدید. توسط اینترسپتور کلاینت استفاده می‌شود؛ مستقیماً در کد اپ فراخوانی نمی‌شود. |

پس از login یا register، اپ از توکن‌های برگشتی استفاده می‌کند؛ برای وضعیت پایه auth نیازی به فراخوانی جداگانه «گرفتن پروفایل» نیست. روت‌های محافظت‌شده و فراخوانی‌های API از همان استور و اینترسپتور استفاده می‌کنند.

---

## ۴. فیلم و جستجو

**فایل:** `src/services/movies.ts`

داده فیلم از بک‌اند گرفته می‌شود؛ پاسخ‌ها به **camelCase** نرمال می‌شوند (مثلاً `poster_path` → `posterPath`).

### دسته‌ها

| کلید فرانت | مسیر API | توضیح |
|-------------:|----------:|--------:|
| `trending` | `/movies/trending` | فیلم‌های ترند |
| `popular` | `/movies/popular` | فیلم‌های محبوب |
| `top_rated` | `/movies/top-rated` | با امتیاز بالا |
| `now_playing` | `/movies/now-playing` | در حال اکران |
| `upcoming` | `/movies/upcoming` | upcoming |

- **لیست:** `GET /movies/{path}?page=1&lang=en` (و در صورت نیاز `genre`, `year`, `sort_by` برای دسته فیلترشده).
- **جستجو:** `GET /movies/search?q=...&page=1&lang=en` با پارامترهای اختیاری `with_genres`, `year`, `vote_average_gte`, `sort_by` (مثلاً `popularity.desc`).

### فیلم تکی

- **جزئیات:** `GET /movies/:id?lang=en`
- **مشابه:** `GET /movies/:id/similar?lang=en`

### بوکمارک (محافظت‌شده)

- **وضعیت:** `GET /movies/:id/bookmark`
- **افزودن:** `POST /movies/:id/bookmark`
- **حذف:** `DELETE /movies/:id/bookmark`

### ژانرها

- **لیست:** `GET /movies/genres?lang=en` (در صورت خطای اندپوینت، لیست ژانر ثابت در `movies.ts` به‌عنوان fallback استفاده می‌شود).

همه اندپوینت‌های فیلم پارامتر کوئری `lang` را می‌پذیرند؛ کلاینت API در صورت نبودن، آن را از زبان UI تزریق می‌کند.

---

## ۵. لیست‌ها (واچ‌لیست، علاقه‌مندی‌ها، تماشاشده)

**فایل:** `src/services/lists.ts`

لیست‌های کاربر محافظت‌شده هستند؛ کلاینت API توکن Bearer را می‌فرستد.

| عمل | متد | اندپوینت |
|-----:|-----:|----------:|
| گرفتن لیست | GET | `/lists/{listName}?page=1&limit=50&sort=addedAt:desc` |
| افزودن فیلم | POST | `/lists/{listName}` — بدنه: `{ tmdbId, title, posterPath? }` |
| حذف فیلم | DELETE | `/lists/{listName}/{tmdbId}` |

`listName` یکی از: `watchlist`, `favorites`, `watched`. توابع کمکی: `watchlistAPI`, `favoritesAPI`, `watchedAPI` (هر کدام با `get`, `add`, `remove`).

---

## ۶. توصیه‌ها

**فایل:** `src/services/recommendations.ts`

توصیه‌های مبتنی بر AI؛ محافظت‌شده.

- **تولید:** `POST /recommendations` — بدنه: `{ query, language?: 'en' | 'fa' }`. تایم‌اوت: ۱۲۰ ثانیه.

توابع کمکی (مثلاً `recommendationQueries.similar(movieTitle, language)`) بدنه درخواست را می‌سازند؛ سرویس `language` را به بک‌اند پاس می‌دهد.

---

## ۷. کاربران و پروفایل

**فایل:** `src/services/users.ts`

همه اندپوینت‌های کاربر محافظت‌شده هستند.

| هدف | متد | اندپوینت |
|-----:|-----:|----------:|
| گرفتن پروفایل | GET | `/users/profile` |
| به‌روزرسانی پروفایل | PUT | `/users/profile` |
| گرفتن آمار | GET | `/users/stats` |
| به‌روزرسانی ترجیحات | PUT | `/users/preferences` |
| به‌روزرسانی حریم خصوصی | PUT | `/users/privacy` |
| به‌روزرسانی فعالیت | PUT | `/users/activity` |
| خروجی داده | GET | `/users/export` |
| حذف اکانت | DELETE | `/users/account` |

تایپ‌ها (مثلاً `UserProfile`, `UserStats`, `UserPreferences`) در `users.ts` تعریف شده‌اند.

---

## ۸. سلامت

**فایل:** `src/services/health.ts`

- **بررسی:** `GET /` — وضعیت سلامت بک‌اند (مثلاً `status`, `message`, `timestamp`).
- **تست:** `testConnection()` دور `checkHealth()` را می‌گیرد و برای بررسی اتصال `{ connected, status, message }` برمی‌گرداند.

---

## ۹. ایندکس سرویس‌ها

**فایل:** `src/services/index.ts`

سرویس‌ها را برای یک مسیر ایمپورت واحد re-export می‌کند (مثلاً `import { login, fetchCategory } from '@/services'`). می‌توانید از ایمپورت مستقیم فایل یا از ایندکس استفاده کنید.

---

## ۱۰. مدیریت خطا

- **خطاهای احراز هویت:** ۴۰۱ توسط کلاینت API (رفرش یا خروج) مدیریت می‌شود. بقیه خطاهای auth (مثلاً ۴۰۰ روی login) به caller واگذار می‌شوند؛ صفحات معمولاً از React Query یا callbackهای mutation و toast برای نمایش پیام استفاده می‌کنند.
- **اعتبارسنجی:** خطاهای اعتبارسنجی بک‌اند معمولاً در بدنه پاسخ (مثلاً `message` یا `errors`) هستند. فرانت آن‌ها را با `t()` برای i18n نمایش می‌دهد.
- **شبکه / تایم‌اوت:** تایم‌اوت axios ۱۵ ثانیه است (۱۲۰ ثانیه برای recommendations). خطاها به کامپوننت‌ها برمی‌گردند؛ در صورت نیاز از error boundary و toast استفاده کنید.

برای الگوها (مثلاً استفاده از React Query، toast روی خطا) به [Design-Patterns.md](Design-Patterns.md) و [Testing.md](Testing.md) مراجعه کنید.

</div>
