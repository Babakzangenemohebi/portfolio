import fs from "fs";
import path from "path";
import { Project, projectsData } from "@/data/projects";

export interface Category {
  id: string;
  label: string;
  value: string;
  color: string;
}

export interface ManagedProject extends Project {
  visible: boolean; // Show on homepage
  featured: boolean; // Featured / pinned
}

export interface GeneralSettings {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  instagram: string;
  telegram: string;
  workExperienceYears: string;
  resumeFileUrl: string;
}

export interface TimelineItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  bulletPoints: string[];
  color: string; // Theme color (purple, green, blue, etc.)
}

interface DbSchema {
  projects: ManagedProject[];
  categories: Category[];
  settings: GeneralSettings;
  timeline: TimelineItem[];
}

const DB_FILE = path.join(process.cwd(), "db.json");

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-ai", label: "هوش مصنوعی", value: "ai", color: "#a855f7" },
  { id: "cat-youtube", label: "نمونه تدوین یوتوب", value: "youtube", color: "#ef4444" },
  { id: "cat-instagram", label: "نمونه تدوین اینستاگرام", value: "instagram", color: "#ec4899" },
  { id: "cat-label", label: "لیبل", value: "label", color: "#fbbf24" },
  { id: "cat-post-story", label: "پست و استوری اینستاگرام", value: "post-story", color: "#e11d48" },
  { id: "cat-motion", label: "موشن", value: "motion", color: "#38bdf8" },
  { id: "cat-flyer-invoice", label: "تراکت، فاکتور و فرم", value: "flyer-invoice", color: "#10b981" },
  { id: "cat-banner-sign", label: "بنر و تابلو", value: "banner-sign", color: "#f59e0b" },
  { id: "cat-menu", label: "منو", value: "menu", color: "#84cc16" },
  { id: "cat-business-card", label: "کارت ویزیت", value: "business-card", color: "#06b6d4" },
  { id: "cat-misc", label: "متفرقه", value: "misc", color: "#6b7280" },
];

const DEFAULT_SETTINGS: GeneralSettings = {
  name: "بابک زنگنه محبی",
  title: "طراح گرافیک و تدوینگر",
  bio: "من بابک زنگنه محبی، متخصص طراحی گرافیک و تدوین ویدیو با بیش از ۶ سال سابقه حرفه‌ای هستم. تخصص من پاسخ‌گویی به تمام نیازهای بصری کسب‌وکارهاست.",
  email: "babakzangenemohebi@gmail.com",
  phone: "09010227355",
  instagram: "https://instagram.com/babakzangenemohebi",
  telegram: "https://t.me/B4BACK",
  workExperienceYears: "۶+",
  resumeFileUrl: "/uploads/1783334168931-resume.pdf",
};

const DEFAULT_TIMELINE: TimelineItem[] = [
  {
    id: "time-1",
    company: "چاپ و تبلیغات هنر پارسی",
    role: "طراح اقلام چاپی و لارج فرمت",
    period: "۱۴۰۲ - ۱۴۰۵ (اکنون)",
    description: "طراحی تخصصی اقلام چاپی اداری، پروژه‌های بزرگ‌مقیاس محیطی و تابلوهای تبلیغاتی نئون و دیجیتال.",
    bulletPoints: [
      "طراحی اقلام چاپی، فرم‌های اداری و کاتالوگ با رعایت دقیق استانداردهای چاپ و رنگ‌شناسی",
      "طراحی لارج فرمت و محیطی شامل بنر، استیکر، شاسی و تابلوهای تبلیغاتی سردر (نئون فلکس و LED)",
      "طراحی و برش وکتور برای دستگاه‌های لیزر و CNC",
      "بهینه‌سازی، اصلاح و افزایش کیفیت تصاویر قدیمی و بی‌کیفیت با ابزارهای هوش مصنوعی برای چاپ بزرگ"
    ],
    color: "#a855f7", // بنفش
  },
  {
    id: "time-2",
    company: "شرکت دوراپزشکی متامدلند (Metamedland)",
    role: "مدیریت محتوا و کمپین‌های تبلیغاتی",
    period: "۱۴۰۱ - ۱۴۰۲",
    description: "تولید و توسعه ساختار محتوای تبلیغاتی و آموزشی تخصصی در حوزه دوراپزشکی (Telemedicine) و مدیریت حضور رسانه‌ای چندزبانه پزشکان.",
    bulletPoints: [
      "مدیریت محتوای تخصصی، تولید و توسعه ساختار محتوای تبلیغاتی و آموزشی پزشکی",
      "طراحی و اجرای کمپین‌های هدفمند تبلیغاتی ویژه جامعه پزشکی و مخاطبان تخصصی",
      "تولید و مدیریت تبلیغات تلویزیونی و نمایشگاهی به زبان‌های کردی، فارسی، انگلیسی و عربی",
      "برندسازی شخصی (Personal Branding) پزشکان و ارتقای پروفایل حرفه‌ای آن‌ها در رسانه‌ها"
    ],
    color: "#10b981", // سبز
  },
  {
    id: "time-3",
    company: "آژانس آوین",
    role: "طراح گرافیک و تدوینگر (دورکاری)",
    period: "۱۴۰۰ - ۱۴۰۱",
    description: "خلق محتوای دیجیتال بصری و تدوین ویدیوها و ریلزهای تعاملی ریتمیک منطبق بر آخرین ترندهای شبکه‌های اجتماعی.",
    bulletPoints: [
      "طراحی گرافیک و ساخت محتوای بصری دیجیتال به صورت دورکاری برای برندهای مختلف",
      "ایده‌پردازی و اجرای کمپین‌های تبلیغاتی چندمنظوره برای اصناف و صنایع گوناگون",
      "تدوین ویدیوهای تعاملی، ریلزها و ویدیوهای اینستاگرامی منطبق بر ترندهای روز",
      "تخصص در تدوین ریتمیک (Music-Driven) و سینک دقیق پلان‌ها با ضرب‌آهنگ موسیقی"
    ],
    color: "#38bdf8", // آبی
  },
  {
    id: "time-4",
    company: "آژانس شتاب",
    role: "سرپرست تدوین و تولید محتوای ویدیویی",
    period: "۱۳۹۸ - ۱۴۰۰",
    description: "سرپرستی و مدیریت باکس تدوین و تولید صفر تا صد محتوای ویدیویی برای کمپین‌های تجاری بزرگ (مانند برند ایران موجو) با تمرکز بر تعامل بالا و بهینه‌سازی گردش کار.",
    bulletPoints: [
      "سرپرستی و مدیریت باکس تدوین پروژه‌های تجاری متنوع با تمرکز ویژه بر برند «ایران موجو»",
      "طراحی و بهینه‌سازی گردش کار (Workflow) تولید محتوا از پیش‌تولید تا پس‌تولید جهت افزایش سرعت و کیفیت",
      "تدوین و آماده‌سازی محتواهای تبلیغاتی و سرگرمی چندپلتفرمی (اینستاگرام، یوتیوب، آپارات و استریم)",
      "همکاری تنگاتنگ با تیم‌های فیلم‌برداری، گرافیک و اتاق فکر برای هم‌راستایی با هویت برند",
      "نظارت مستمر بر کیفیت فنی و هنری ویدیوها جهت جلب مشارکت حداکثری مخاطبان (Engagement)"
    ],
    color: "#ef4444", // قرمز و زرد
  }
];

export function getDb(): DbSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DbSchema = {
      projects: projectsData.map(p => ({
        ...p,
        visible: true,
        featured: false
      })),
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      timeline: DEFAULT_TIMELINE,
    };
    saveDb(initialData);
    return initialData;
  }
  try {
    const fileContent = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(fileContent);
    // Fill defaults if some keys are missing (e.g. settings or timeline)
    if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS;
    if (!parsed.timeline) parsed.timeline = DEFAULT_TIMELINE;
    return parsed;
  } catch (error) {
    console.error("Failed to read database file, returning default structure", error);
    return {
      projects: [],
      categories: [],
      settings: DEFAULT_SETTINGS,
      timeline: DEFAULT_TIMELINE,
    };
  }
}

export function saveDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to database file", error);
  }
}
