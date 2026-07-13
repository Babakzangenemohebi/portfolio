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
  title: "معمار بصری، تدوینگر و تولیدکننده محتوا",
  bio: "من زبان برندها را به «حرکت» و «تصویر» تبدیل می‌کنم.",
  email: "babakzangenemohebi@gmail.com",
  phone: "09120000000",
  instagram: "https://instagram.com/babakzangenemohebi",
  telegram: "https://t.me/B4BACK",
  workExperienceYears: "۵+",
  resumeFileUrl: "/resume.pdf",
};

const DEFAULT_TIMELINE: TimelineItem[] = [
  {
    id: "time-1",
    company: "چاپ و تبلیغات هنر پارسی",
    role: "طراح گرافیک تخصصی چاپ و لارج فرمت",
    period: "۱۴۰۲ - ۱۴۰۵ (اکنون)",
    description: "طراحی فرم‌های چاپی، بیلبوردها و تابلوهای تبلیغاتی محیطی.",
    bulletPoints: [
      "خلق هویت‌های بصری، لوگوها، کاتالوگ‌ها، بروشورها و کارت‌های ویزیت اختصاصی.",
      "تخصص در بسته‌بندی‌های پیچیده صنعتی و خروجی‌های تفکیک رنگ چاپی عریض (CMYK).",
      "طراحی تابلوی سردر شعب، لایت‌باکس‌ها و بنرهای محیطی متناسب با متریال ساخت."
    ],
    color: "#a855f7", // بنفش
  },
  {
    id: "time-2",
    company: "شرکت دوراپزشکی متامدلند (Metamedland)",
    role: "مسئول تولید محتوا و طراح کمپین",
    period: "۱۴۰۱ - ۱۴۰۲",
    description: "مدیریت و توسعه هویت محتوایی برند در حوزه دوراپزشکی و ارتقای تبلیغات سمینارها.",
    bulletPoints: [
      "طراحی و مدیریت کمپین‌های تبلیغاتی دیجیتال و آموزشی برای مخاطبان تخصصی حوزه پزشکی.",
      "تولید ساختارهای ویدیویی معرفی خدمات تله‌مدیسین و پرزنتیشن برای حضور در سمینارها و نمایشگاه‌ها.",
      "توسعه ساختار محتوایی یکپارچه که موجب ارتقای نرخ جذب پزشکان به پلتفرم شد."
    ],
    color: "#10b981", // سبز
  },
  {
    id: "time-3",
    company: "آژانس تولید محتوا آوین (AVIN)",
    role: "طراح گرافیک و تولیدکننده محتوای دیجیتال (دورکاری)",
    period: "۱۴۰۰ - ۱۴۰۱",
    description: "اجرای پروژه‌های گرافیکی متنوع به صورت آزادکار و فریلنس.",
    bulletPoints: [
      "طراحی پست، استوری و جلوه‌های بصری متناظر برای شبکه‌های اجتماعی.",
      "خلق وکتور آرت، لوگوهای مینیمال و بنرهای وب تعاملی.",
      "همکاری در کمپین‌های مختلف دیجیتال مارکتینگ و تحویل سریع آثار گرافیکی."
    ],
    color: "#38bdf8", // آبی
  },
  {
    id: "time-4",
    company: "آژانس تولید محتوا شتاب",
    role: "مسئول باکس تدوین و تولید محتوای ویدیویی",
    period: "۱۳۹۸ - ۱۴۰۰",
    description: "سرپرستی مراحل تدوین ویدیو، تولید جلوه‌های ویژه و هماهنگی با تیم فیلم‌برداری.",
    bulletPoints: [
      "تدوین تیزرهای تبلیغاتی، سناریونویسی و ویدیوهای تایپوگرافی برای برندهای معتبر از جمله ایران موجو.",
      "مدیریت ریتم تولید و گردش کار تدوین از پیش‌تولید تا ویرایش نهایی فیلم‌ها.",
      "همکاری مستقیم با مدیر خلاقیت برای توسعه سناریوهای بصری و B-Roll های سینمایی."
    ],
    color: "#ef4444", // قرمز و زرد (استفاده از قرمز به همراه تم پس‌زمینه زرد)
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
