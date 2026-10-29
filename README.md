# پورتفولیو — بابک زنگنه محبی

سایت شخصی و **مینی‌اپ تلگرام** برای نمایش نمونه‌کارهای طراحی گرافیک، چاپ و لارج‌فرمت، موشن‌گرافیک و تدوین ویدیو.

- 🌐 نسخه‌ی زنده: <https://babakzangenemohebi.github.io/portfolio/>
- 🤖 ربات تلگرام: [@B4backPortfoliobot](https://t.me/B4backPortfoliobot)
- 🎨 استک: HTML + CSS + JavaScript خالص (بدون فریم‌ورک، بدون مرحله‌ی build) + GitHub Pages

---

## ساختار پروژه

```
site/                 ← کل اپلیکیشن (همین پوشه منتشر می‌شود)
  index.html          ← صفحه‌ی اصلی (RTL، فارسی)
  404.html            ← صفحه‌ی خطا
  data.json           ← داده‌های سایت (خروجی خودکار db.json)
  manifest.webmanifest
  assets/
    styles.css        ← دیزاین‌سیستم، لِی‌اوت و انیمیشن‌ها
    app.js            ← رندر نمونه‌کارها، فیلترها، لایت‌باکس، تلگرام
    favicon.svg
db.json               ← منبع اصلی محتوا (پروژه‌ها، دسته‌ها، رزومه، اطلاعات تماس)
scripts/build-data.mjs← تبدیل db.json به site/data.json
public/uploads/       ← تصاویر، ویدیوها و PDF رزومه
public/images/        ← پرتره
legacy-next/          ← نسخه‌ی قبلی (Next.js) — فقط آرشیو، در انتشار استفاده نمی‌شود
.github/workflows/    ← انتشار خودکار روی GitHub Pages
```

## ویرایش محتوا

همه‌ی محتوا در `db.json` است. بعد از هر تغییر:

```bash
node scripts/build-data.mjs     # یا: npm run data
```

سپس commit و push کنید؛ سایت به‌صورت خودکار در ۱–۲ دقیقه به‌روز می‌شود.

### افزودن پروژه‌ی جدید

یک آبجکت به آرایه‌ی `projects` اضافه کنید:

```json
{
  "id": "project-1700000000000",
  "title": "نام پروژه",
  "category": "motion",
  "categoryLabel": "موشن",
  "description": "توضیح کوتاه",
  "longDescription": "توضیح کامل (اختیاری)",
  "tools": ["After Effects"],
  "client": "نام کارفرما",
  "year": "1405",
  "coverUrl": "/uploads/cover.jpg",
  "mediaUrl": "/uploads/main.jpg",
  "mediaGallery": [
    { "type": "image", "url": "/uploads/1.jpg" },
    { "type": "video", "url": "/uploads/clip.mp4" }
  ],
  "highlightColor": "#ff6b35",
  "visible": true,
  "featured": false
}
```

فایل‌های رسانه را در `public/uploads/` بگذارید. مسیرها را با `/` شروع کنید؛ اسکریپت خودش آن‌ها را به مسیر نسبی تبدیل می‌کند.

## امکانات

- طراحی تیره‌ی پریمیوم، کاملاً ریسپانسیو (موبایل / تبلت / دسکتاپ)
- گالری نمونه‌کار با فیلتر دسته‌بندی و شمارش
- لایت‌باکس با پشتیبانی تصویر و ویدیو، سوایپ، کلیدهای جهت‌دار و BackButton تلگرام
- تایم‌لاین رزومه، شمارنده‌های متحرک، انیمیشن‌های اسکرول
- نوار ناوبری پایین در موبایل (تجربه‌ی اپ‌مانند)
- یکپارچگی کامل با Telegram Mini App: `expand`، رنگ هدر، Haptic Feedback، safe-area
- PWA manifest + صفحه‌ی ۴۰۴ اختصاصی

## انتشار

هر push روی شاخه‌ی `main` باعث اجرای `.github/workflows/deploy.yml` می‌شود:
`site/` + `public/uploads` + `public/images` در یک artifact مونتاژ و روی GitHub Pages منتشر می‌شوند.

---

© ۱۴۰۵ بابک زنگنه محبی
