<div dir="rtl">

# فرانت‌اند Filmchi

**English:** [README.md](README.md)

Filmchi یک فرانت‌اند React برای اپ فیلم Filmchi است: مرور فیلم‌های ترند و دسته‌بندی، جستجو، مشاهدهٔ جزئیات، مدیریت بوکمارک و لیست‌ها و دریافت پیشنهاد مبتنی بر هوش مصنوعی. با [API بک‌اند Filmchi](https://github.com/your-org/filmchi-back) برای احراز هویت، فیلم‌ها، لیست‌ها و پیشنهادها ارتباط دارد.

## پشته فناوری

- **React 18** + **TypeScript**
- **Vite** — ساخت و سرور توسعه
- **React Router v6** — مسیریابی
- **Zustand** — استیت سراسری (احراز هویت، UI)
- **TanStack Query** — استیت سرور و کش
- **i18next** — بین‌المللی‌سازی (انگلیسی، فارسی، RTL)
- **Tailwind CSS** — استایل
- **Vitest** + **React Testing Library** — تست

## راه‌اندازی پروژه

```bash
npm install
# یا
yarn install
```

## محیط

یک فایل `.env` (یا `.env.local`) با محتوای زیر بسازید:

```
VITE_API_BASE_URL=http://localhost:3001
```

- در صورت تنظیم نکردن، پیش‌فرض `http://localhost:3001` است. بک‌اند باید در حال اجرا باشد و CORS این origin را مجاز کند (مثلاً `http://localhost:1700` برای سرور توسعهٔ Vite).
- برای اجرای پایه متغیر محیط دیگری لازم نیست؛ اختیاری: `VITE_*` برای feature flag یا آنالیتیکس در صورت اضافه کردن بعداً.

## اجرای پروژه

```bash
# توسعه (سرور روی پورت ۱۷۰۰)
npm run dev
# یا
yarn dev

# ساخت نسخهٔ تولید
npm run build
# یا
yarn build

# پیش‌نمایش نسخهٔ تولید (مثلاً پورت ۱۷۰۰)
npm run preview
# یا
yarn preview
```

در مرورگر [http://localhost:1700](http://localhost:1700) را باز کنید.

## اجرای تست‌ها

```bash
npm run test
# یا
yarn test

# Vitest UI (تعاملی)
yarn test:ui
```

تست‌ها در `src/__tests__/` قرار دارند. برای استراتژی و موجودی تست [docs/Testing.fa.md](docs/Testing.fa.md) را ببینید.

## ساختار پروژه

| مسیر | توضیح |
|:-----|:------|
| `src/pages/` | صفحات سطح مسیر (خانه، جستجو، ورود، جزئیات فیلم، بوکمارک‌ها، لیست‌ها، پیشنهادها، پروفایل، اکانت و غیره) |
| `src/components/` | UI قابل استفاده مجدد (مثلاً `MovieCard`, `HorizontalScroll`) و اولیه‌های `ui/` (دکمه، کارت، ورودی، تب، دیالوگ، اسکلتون) |
| `src/services/` | لایهٔ API: `api.ts` (axios + اینترسپتورها)، `auth.ts`, `movies.ts`, `lists.ts`, `recommendations.ts`, `users.ts`, `health.ts` |
| `src/stores/` | استورهای Zustand: `useAuthStore`, `useUiStore` |
| `src/shared/` | `AppLayout`, `ProtectedRoute` |
| `src/hooks/` | هوک‌های سفارشی (مثلاً `useDebounce`) |
| `src/i18n/` | پیکربندی i18next و فایل‌های locale (`en.json`, `fa.json`) |
| `src/router.tsx` | تعریف مسیرهای React Router v6 |
| `src/__tests__/` | تست‌های Vitest + RTL |

## قابلیت‌های اصلی

- **احراز هویت:** ورود، ثبت‌نام، JWT (access + refresh). توکن‌ها در localStorage ذخیره می‌شوند؛ اینترسپتور axios برنر را می‌چسباند و در ۴۰۱ رفرش را انجام می‌دهد.
- **خانه:** کاروسل‌های ترند، پاپولار، امتیاز بالا، در حال پخش، upcoming؛ لینک به دسته و جزئیات فیلم.
- **جستجو:** کوئری از URL (`?q=...`)، فیلترها، صفحه‌بندی، ژانرها.
- **جزئیات فیلم:** عنوان، خلاصه، فیلم‌های مشابه، بوکمارک و امتیاز (وقتی لاگین باشد).
- **بوکمارک‌ها / لیست‌ها:** مشاهده و مدیریت واچ‌لیست و لیست دیده‌شده (و سایر انواع لیست پشتیبانی‌شده توسط API).
- **پیشنهادها:** پیشنهاد مبتنی بر هوش مصنوعی (بک‌اند از LLM + TMDB استفاده می‌کند).
- **پروفایل / اکانت:** پروفایل کاربر و تنظیمات اکانت.
- **i18n:** انگلیسی و فارسی؛ چیدمان RTL وقتی زبان فارسی است.

## مستندات

همهٔ مستندات در **دو نسخه** موجود هستند: انگلیسی (`.md`) و فارسی (`.fa.md`، راست به چپ).

| سند | English | فارسی |
|:----|:--------|:------|
| دیزاین پترن‌ها | [docs/Design-Patterns.md](docs/Design-Patterns.md) | [docs/Design-Patterns.fa.md](docs/Design-Patterns.fa.md) |
| تست | [docs/Testing.md](docs/Testing.md) | [docs/Testing.fa.md](docs/Testing.fa.md) |
| یکپارچه‌سازی بک‌اند | [docs/Backend-Integration.md](docs/Backend-Integration.md) | [docs/Backend-Integration.fa.md](docs/Backend-Integration.fa.md) |
| محلی‌سازی (i18n) | [docs/Localization.md](docs/Localization.md) | [docs/Localization.fa.md](docs/Localization.fa.md) |

## عیب‌یابی

- **صفحه خالی / CORS:** مطمئن شوید بک‌اند در حال اجراست و `CORS_ORIGIN` (یا معادل) شامل `http://localhost:1700` (یا originی که استفاده می‌کنید) باشد. `VITE_API_BASE_URL` را بررسی کنید.
- **۴۰۱ روی درخواست‌ها:** دوباره وارد شوید؛ اگر رفرش شکست خورد، localStorage را پاک کنید (`filmchi_access_token`, `filmchi_refresh_token`) و وارد شوید.
- **شکست تست‌ها:** در یک نصب تمیز `yarn test` را اجرا کنید؛ از وجود `vitest.setup.ts` و `src/__tests__/` اطمینان حاصل کنید. در صورت اضافه کردن mock جدید، در جایی که لازم است در `beforeEach` استورها را ریست کنید.

## مجوز

MIT

</div>
