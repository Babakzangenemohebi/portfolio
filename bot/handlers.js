/**
 * Shared Telegram bot logic for @B4backPortfoliobot.
 * Used by poll.js (GitHub Actions runtime) and server.js (optional webhook mode).
 */

const MINIAPP = process.env.MINIAPP_URL || "https://babakzangenemohebi.github.io/portfolio/";
const RESUME = MINIAPP + "uploads/1783334168931-resume.pdf";
const TG = "https://t.me/B4BACK";
const IG = "https://instagram.com/babakzangenemohebi";
const MAIL = "babakzangenemohebi@gmail.com";

const TOKEN = process.env.BOT_TOKEN;
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

export async function api(method, payload, timeoutMs = 15000) {
  if (!API) throw new Error("BOT_TOKEN is not set");
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  return res.json().catch(() => ({ ok: false }));
}

const appButton = { text: "🎨 مشاهده پورتفولیو", web_app: { url: MINIAPP } };

const contactKeyboard = {
  inline_keyboard: [
    [appButton],
    [
      { text: "💬 پیام در تلگرام", url: TG },
      { text: "📸 اینستاگرام", url: IG },
    ],
    [{ text: "✉️ ایمیل", url: `mailto:${MAIL}` }],
  ],
};

const WELCOME = `سلام 👋
من دستیار پورتفولیوی <b>بابک زنگنه محبی</b> هستم.

بابک طراح گرافیک و تدوینگر ویدیو با <b>۶+ سال</b> تجربه است:
• هویت بصری، کارت ویزیت، منو و لیبل
• چاپ، لارج‌فرمت و تابلو تبلیغاتی
• موشن‌گرافیک و تدوین سینماتیک
• تولید محتوا با هوش مصنوعی

برای دیدن نمونه‌کارها، مینی‌اپ را باز کنید 👇`;

const ABOUT = `<b>درباره بابک</b>
طراح گرافیک و تدوینگر با بیش از ۶ سال سابقه حرفه‌ای؛ از چاپ و لارج‌فرمت تا موشن‌گرافیک و محتوای مبتنی بر هوش مصنوعی.

<b>ابزارها:</b> Photoshop · Illustrator · InDesign · Premiere Pro · After Effects · CorelDRAW

<b>سابقه:</b>
• چاپ و تبلیغات هنر پارسی (۱۴۰۲–اکنون)
• متامدلند — مدیریت محتوا و کمپین (۱۴۰۱–۱۴۰۲)
• آژانس آوین — گرافیک و تدوین (۱۴۰۰–۱۴۰۱)
• آژانس شتاب — سرپرست تدوین (۱۳۹۸–۱۴۰۰)`;

const CONTACT = `<b>راه‌های ارتباط</b>
تلگرام: @B4BACK
ایمیل: ${MAIL}
تلفن: ۰۹۰۱۰۲۲۷۳۵۵
اینستاگرام: @babakzangenemohebi

برای سفارش، کافی است پیام بدهید — معمولاً کمتر از یک روز کاری پاسخ می‌دهیم.`;

const HELP = `دستورها:
/start — شروع و دیدن پورتفولیو
/portfolio — باز کردن مینی‌اپ
/about — درباره من
/resume — دریافت رزومه
/contact — راه‌های ارتباط`;

export async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  const cmd = text.startsWith("/") ? text.split(/[\s@]/)[0].toLowerCase() : "";

  if (!cmd) {
    return api("sendMessage", {
      chat_id: chatId,
      text: "برای دیدن نمونه‌کارها مینی‌اپ را باز کنید 👇\nگفتگوی مستقیم: @B4BACK",
      reply_markup: contactKeyboard,
      disable_web_page_preview: true,
    });
  }
  if (cmd === "/start" || cmd === "/app" || cmd === "/portfolio") {
    return api("sendMessage", {
      chat_id: chatId,
      text: WELCOME,
      parse_mode: "HTML",
      reply_markup: contactKeyboard,
      disable_web_page_preview: true,
    });
  }
  if (cmd === "/about") {
    return api("sendMessage", {
      chat_id: chatId,
      text: ABOUT,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[appButton]] },
      disable_web_page_preview: true,
    });
  }
  if (cmd === "/contact") {
    return api("sendMessage", {
      chat_id: chatId,
      text: CONTACT,
      parse_mode: "HTML",
      reply_markup: contactKeyboard,
      disable_web_page_preview: true,
    });
  }
  if (cmd === "/resume") {
    return api("sendDocument", { chat_id: chatId, document: RESUME, caption: "رزومه بابک زنگنه محبی (PDF)" });
  }
  return api("sendMessage", {
    chat_id: chatId,
    text: HELP,
    reply_markup: { inline_keyboard: [[appButton]] },
  });
}

export async function handleUpdate(update) {
  if (update.message && update.message.chat) return handleMessage(update.message);
  return null;
}
