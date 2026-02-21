<div dir="rtl">

# محلی‌سازی (i18n)

**English:** [Localization (i18n)](Localization.md)

---

این سند توضیح می‌دهد **بین‌المللی‌سازی (i18n)** و **محلی‌سازی** در فرانت‌اند Filmchi چگونه کار می‌کند: راه‌اندازی، کلیدهای ترجمه، پشتیبانی RTL برای فارسی، و نحوه افزودن یا تغییر ترجمه‌ها.

---

## ۱. پشته و پیکربندی

| پکیج | کاربرد |
|------:|--------:|
| **i18next** | موتور اصلی i18n (تشخیص زبان، درون‌یابی، بارگذاری منابع). |
| **react-i18next** | اتصال به ری‌اکت: `useTranslation()`، `Trans` و یکپارچه‌سازی با کامپوننت‌ها. |
| **i18next-browser-languagedetector** | تشخیص اختیاری؛ Filmchi ترجیح می‌دهد انتخاب کاربر در localStorage ذخیره شود. |

**فایل پیکربندی:** `src/i18n/index.ts`

- **منابع:** دو لوکال: `en` (انگلیسی) و `fa` (فارسی). JSON ترجمه در `src/i18n/locales/en.json` و `fa.json` است.
- **زبان اولیه:** از `localStorage.getItem('filmchi_lang')` خوانده می‌شود؛ در صورت نبودن پیش‌فرض `'en'`.
- **Fallback:** `fallbackLng: 'en'` — کلیدهای موجود در `fa` در صورت نبودن به انگلیسی برگردانده می‌شوند.
- **درون‌یابی:** `escapeValue: false` — ری‌اکت خودش escape می‌کند؛ از double-escaping HTML جلوگیری می‌شود.

اپ با i18n بوت‌استرپ می‌شود (مثلاً در `main.tsx` روت wrap می‌شود تا `useTranslation` همه‌جا در دسترس باشد).

---

## ۲. فایل‌های لوکال و ساختار کلید

**مسیرها:** `src/i18n/locales/en.json`, `src/i18n/locales/fa.json`

هر دو فایل **ساختار کلید** یکسانی دارند. کلیدها بر اساس فیچر یا بخش گروه‌بندی شده‌اند:

| نام‌فضا (کلید سطح اول) | کاربرد |
|-------------------------:|--------:|
| `app` | عنوان اپ، برچسب‌های منو، خانه/ورود/ثبت‌نام، زبان، تم، UI عمومی. |
| `auth` | برچسب‌ها و placeholderهای فرم ورود/ثبت‌نام، پیام‌های اعتبارسنجی، toast موفقیت/خطا. |
| `home` | صفحه خانه: عناوین دسته (ترند، محبوب و غیره)، بارگذاری بیشتر، مشاهده همه، بارگذاری/خطا. |
| `search` | صفحه جستجو: عنوان، placeholder، فیلترها، گزینه‌های مرتب‌سازی، تاریخچه، تعداد نتایج، خالی/خطا. |
| `movie` | جزئیات فیلم: خلاصه، مشابه، بوکمارک، امتیاز، تاریخ اکران و غیره. |
| `category` | صفحه دسته: عنوان، صفحه‌بندی، بارگذاری، خطا. |
| `bookmarks` | صفحه بوکمارک‌ها: عنوان، حالت خالی، اقدامات. |
| `lists` | لیست‌ها: واچ‌لیست، علاقه‌مندی‌ها، تماشاشده، افزودن/حذف، حالت خالی. |
| `recommendations` | توصیه‌های AI: فرم، placeholder، ارسال، نتایج، خالی/خطا. |
| `profile` | صفحه پروفایل: عنوان، بخش‌ها، ویرایش. |
| `settings` | صفحه تنظیمات و گزینه‌ها. |
| `account` | مدیریت اکانت: ایمیل، تغییر رمز، ناحیه خطر. |
| `stats` | برچسب‌های آمار کاربر. |

**مثال (en):**

</div>

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

<div dir="rtl">

**درون‌یابی:** در JSON از `{{variable}}` استفاده کنید و به عنوان آرگومان دوم `t()` یک آبجکت پاس دهید:

</div>

```json
"results_count": "{{count}} results found"
```

```ts
t('search.results_count', { count: 42 })
```

<div dir="rtl">

---

## ۳. استفاده از ترجمه‌ها در کامپوننت‌ها

از هوک **`useTranslation()`** از `react-i18next` استفاده کنید:

</div>

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

<div dir="rtl">

- **`t(key)`** — رشته زبان فعلی را برمی‌گرداند (با آرگومان دوم اختیاری برای درون‌یابی).
- **`i18n.changeLanguage(lang)`** — زبان فعال را عوض می‌کند؛ همگام‌سازی استور UI و جهت document در جای دیگر انجام می‌شود (پایین را ببینید).

برای کلیدهای تو در تو از **نقطه** استفاده کنید: `t('auth.email')`, `t('home.trending')`, `t('movie.similar_movies')`.

---

## ۴. وضعیت زبان و RTL

**زبان UI** در **Zustand** و **localStorage** ذخیره و با i18n و جهت document همگام نگه داشته می‌شود.

**استور:** `src/stores/useUiStore.ts`

- **State:** `language: 'en' | 'fa'`, `setLanguage(lang)`.
- **پایداری:** با تغییر زبان، `localStorage.setItem('filmchi_lang', lang)` فراخوانی می‌شود.
- **بار اول:** هنگام بارگذاری اپ، `document.documentElement.dir` از زبان ذخیره‌شده تنظیم می‌شود (`'rtl'` برای `fa`, `'ltr'` برای `en`) و در صورت نیاز کلاس `dark` از تم اعمال می‌شود.

**همگام با i18n:** در `src/shared/AppLayout.tsx` یک `useEffect` با تغییر `language` (از `useUiStore`) اجرا می‌شود:

- `i18n.changeLanguage(language)` — تا همه فراخوانی‌های `t()` با لوکال جدید دوباره رندر شوند.
- `document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'` — تا چیدمان و کلاس‌های RTL تیلویند (مثلاً `rtl:` یا logical properties) درست اعمال شوند.

وقتی کاربر در UI «فارسی» را انتخاب می‌کند:

1. `setLanguage('fa')` فراخوانی می‌شود (استور + localStorage).
2. effect اجرا می‌شود → i18n به `fa` می‌رود، `dir` برابر `rtl` می‌شود.
3. همه کامپوننت‌هایی که از `t()` استفاده می‌کنند متن فارسی نشان می‌دهند؛ چیدمان به RTL تغییر می‌کند.

**استایل RTL:** در صورت نیاز از کلاس‌های RTL تیلویند استفاده کنید (مثلاً `ms-2`, `me-4` یا `rtl:...`) تا فاصله و تراز در هر دو جهت درست باشد. با انتخاب `fa` تست کنید.

---

## ۵. افزودن یا تغییر ترجمه‌ها

1. **هر دو فایل لوکال را ویرایش کنید** — کلیدها در `en.json` و `fa.json` یکسان باشند؛ فقط مقدارها متفاوت.
2. **کلید را** زیر نام‌فضای مناسب اضافه کنید (مثلاً `search.no_results`).
3. **در کد استفاده کنید** — `t('search.no_results')` یا با درون‌یابی: `t('search.results_count', { count })`.

**افزودن نام‌فضای جدید:** در هر دو فایل JSON یک آبجکت سطح اول جدید اضافه کنید (مثلاً `"notifications": { "mark_read": "Mark as read" }`) و از `t('notifications.mark_read')` استفاده کنید.

**بهترین روش‌ها:**

- از نام کلید کوتاه و یکدست استفاده کنید (مثلاً `login_failed`؛ در JSON از snake_case استفاده می‌شود).
- برای یک مفهوم یک کلید مشترک استفاده کنید تا تکرار نشود.
- برای پیام‌های پویا یا جمع، از درون‌یابی یا در صورت افزودن بعدی، pluralization خود i18next استفاده کنید.

---

## ۶. بک‌اند و زبان

زبان UI در جایی که مرتبط است به بک‌اند فرستاده می‌شود:

- **کلاینت API:** برای `/movies` و `/recommendations`، کلاینت axios مشترک پارامتر کوئری `lang` را از `useUiStore.getState().language` اضافه می‌کند تا بک‌اند عنوان/خلاصه محلی‌سازی‌شده (مثلاً از TMDB) برگرداند.
- **توصیه‌ها:** سرویس recommendations در بدنه درخواست `language` می‌پذیرد و به بک‌اند پاس می‌دهد.

بنابراین تغییر زبان اپ هم روی رشته‌های فرانت (i18n) و هم روی زبان محتوای فیلم/توصیه از API اثر می‌گذارد. جزئیات در [Backend-Integration.md](Backend-Integration.md).

---

## ۷. خلاصه

| موضوع | کجا / چگونه |
|--------:|-------------:|
| پیکربندی | `src/i18n/index.ts` — منابع، fallback، درون‌یابی. |
| فایل‌های لوکال | `src/i18n/locales/en.json`, `fa.json` — ساختار کلید یکسان. |
| در کامپوننت‌ها | `useTranslation()` → `t('key')`، اختیاری `t('key', { var })`. |
| وضعیت زبان | `useUiStore`: `language`, `setLanguage`؛ ذخیره در `filmchi_lang`. |
| همگام‌سازی و RTL | effect در `AppLayout`: `i18n.changeLanguage(language)`, `document.documentElement.dir`. |
| بک‌اند | کلاینت API و recommendations مقدار `lang` / `language` را از زبان UI می‌فرستند. |

برای الگوهای طراحی که از i18n استفاده می‌کنند (مثلاً layout، guardها) به [Design-Patterns.md](Design-Patterns.md) مراجعه کنید. برای تست‌هایی که زبان و RTL را چک می‌کنند به [Testing.md](Testing.md) مراجعه کنید.

</div>
