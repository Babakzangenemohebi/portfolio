export interface ProjectMedia {
  type: "image" | "video";
  url: string;
}

export interface Project {
  id: string;
  title: string;
  category: "ai" | "youtube" | "instagram" | "label" | "post-story" | "motion" | "flyer-invoice" | "banner-sign" | "menu" | "business-card" | "misc";
  categoryLabel: string;
  description: string;
  longDescription: string;
  tags: string[];
  tools: string[];
  mediaUrl: string;
  coverUrl?: string; // cropped thumbnail used in portfolio grid
  videoUrl?: string;
  client?: string;
  year?: string;
  highlightColor?: string;
  mediaGallery?: ProjectMedia[];
}

export const projectsData: Project[] = [
  {
    id: "project-1",
    title: "هویت بصری و پوستر سینمایی فیلم کوتاه «مرزهای شیشه‌ای»",
    category: "banner-sign",
    categoryLabel: "بنر و تابلو",
    description: "طراحی پوستر سینمایی قطع بزرگ، هویت بصری یکپارچه و تایپوگرافی اختصاصی برای اکران بین‌المللی فیلم.",
    longDescription: "در این پروژه، کانسپت بصری فیلم بر اساس تضاد نور و سایه و حس تعلیق داستان شکل گرفت. از تایپوگرافی دستی (کالیگرافی مدرن) برای عنوان فیلم استفاده شد و خروجی در قالب لایت‌باکس‌های سینمایی اکران بزرگ و فرم‌های چاپی عریض با بالاترین استانداردهای تفکیک رنگ طراحی و آماده‌سازی شد.",
    tags: ["پوستر سینمایی", "تایپوگرافی", "هویت بصری", "لارج فرمت"],
    tools: ["فتوشاپ", "ایلاستریتور", "کورل‌دراو"],
    mediaUrl: "/images/projects/poster-glass.png",
    client: "انجمن سینمای جوانان ایران",
    year: "۱۴۰۳",
    highlightColor: "#ff6b35"
  },
  {
    id: "project-2",
    title: "تیزر تبلیغاتی سینماتیک و اصلاح رنگ برند «متا لند»",
    category: "youtube",
    categoryLabel: "نمونه تدوین یوتوب",
    description: "تدوین، سناریونویسی و اصلاح رنگ تخصصی تیزر معرفی تجهیزات دوراپزشکی در نمایشگاه‌های بین‌المللی.",
    longDescription: "این پروژه شامل تدوین ریتمیک ویدیوهای ضبط شده در سمینارها و کلینیک‌ها، سناریونویسی برای معرفی خدمات و استفاده از افکت‌های حرکتی روان (موشن‌گرافیک) جهت توضیح فرآیند دوراپزشکی بود. فرآیند اصلاح رنگ (Color Grading) به منظور ایجاد حس مدرن، تمیز و پزشکی (Teal & Orange) با دقت بالا در پریمیر و لایت‌باکس‌های موشن صورت پذیرفت.",
    tags: ["تدوین سینماتیک", "اصلاح رنگ", "سناریونویسی", "موشن گرافیک"],
    tools: ["پریمیر پرو", "افترافکت", "آدیشن"],
    mediaUrl: "/images/projects/meta-telehealth.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-medical-professional-working-with-a-microscope-41584-large.mp4",
    client: "شرکت دوراپزشکی متامدلند (Metamedland)",
    year: "۱۴۰۲",
    highlightColor: "#00adb5"
  },
  {
    id: "project-3",
    title: "دیاگرام‌های سه‌بعدی تعاملی و آنالیز معماری مدلند",
    category: "misc",
    categoryLabel: "متفرقه",
    description: "طراحی کانسپت و دیاگرام‌های ایزومتریک سه‌بعدی برای شبیه‌سازی بصری فرآیندهای پزشکی از راه دور.",
    longDescription: "شبیه‌سازی فرآیندهای پیچیده در قالب دیاگرام‌های بصری سه‌بعدی و ایزومتریک. در این پروژه، کانسپت جریان داده‌ها و ارتباط بین بیمارستان مرجع و پزشک از راه دور به کمک مدلسازی سه‌بعدی وکتور و رندرهای فلتِ جذاب تبدیل به تصاویری گویانما (Infographics) شد تا در کمپین‌های آموزشی نمایش داده شود.",
    tags: ["دیاگرام ایزومتریک", "مدلسازی سه بعدی", "وکتور آرت"],
    tools: ["ایلاستریتور", "فتوشاپ", "کورل‌دراو"],
    mediaUrl: "/images/projects/isometric-diagram.png",
    client: "مجموعه مدلند",
    year: "۱۴۰۴",
    highlightColor: "#00adb5"
  },
  {
    id: "project-4",
    title: "هویت برند دیجیتال و کمپین تبلیغاتی آژانس «شتاب»",
    category: "business-card",
    categoryLabel: "کارت ویزیت",
    description: "طراحی کامل ست اداری، کاتالوگ‌های چاپی، بیلبورد سردر شعبه‌ها و قالب‌های محتوای شبکه‌های اجتماعی.",
    longDescription: "طراحی و توسعه یک هویت بصری پویا و پرانرژی متناسب با سرعت و خلاقیت آژانس تولید محتوا. این هویت در قالب فرم‌های چاپی لارج فرمت، کاتالوگ‌های معرفی خدمات، بنرهای نمایشگاهی و ست اداری لوکس اجرا شد. تمام فایل‌های خروجی جهت چاپ با استفاده از کدهای رنگی دقیق CMYK در کورل‌دراو آماده شدند.",
    tags: ["هویت برند", "کاتالوگ", "بیلبورد", "چاپ عریض"],
    tools: ["کورل‌دراو", "ایلاستریتور", "فتوشاپ"],
    mediaUrl: "/images/projects/shetab2-brand.png",
    client: "آژانس شتاب",
    year: "۱۳۹۹",
    highlightColor: "#ff6b35"
  },
  {
    id: "project-5",
    title: "موزیک ویدیو ریتمیک و لوگوموشن پویا «B4BACK»",
    category: "motion",
    categoryLabel: "موشن",
    description: "تدوین ریتمیک ویدیو کلیپ کوتاه همراه با آهنگسازی اختصاصی و انیمیشن لوگوی سه‌بعدی متناظر با موسیقی.",
    longDescription: "در این پروژه، تدوین ریتمیک (Beat-matching) با استفاده از کلیپ‌های پرسرعت انجام شده است. آهنگسازی و ویرایش صدا در محیط Ableton Live انجام گرفت و افکت‌های جلوه‌های ویژه و حرکت لوگو (Logomotion) در افترافکت پیاده‌سازی و همگام شد تا هماهنگی کاملی بین صدا و تصویر به وجود آید.",
    tags: ["لوگوموشن", "آهنگسازی", "تدوین ریتمیک", "طراحی صدا"],
    tools: ["افترافکت", "پریمیر پرو", "ایبلتون لایو", "آدیشن"],
    mediaUrl: "/images/projects/b4back-logo.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41719-large.mp4",
    client: "پروژه شخصی B4BACK",
    year: "۱۴۰۵",
    highlightColor: "#ff6b35"
  },
  {
    id: "project-6",
    title: "تولید تیزر مولد و کانسپت‌های بصری با هوش مصنوعی",
    category: "ai",
    categoryLabel: "هوش مصنوعی",
    description: "طراحی کانسپت آرت و تیزرهای انیمیشنی کوتاه با تلفیق تکنیک‌های هوش مصنوعی مولد تصاویر و تدوین انسانی.",
    longDescription: "این پروژه پیشرو، نشان‌دهنده توانایی تلفیق هوش مصنوعی در چرخه کاری خلاقانه است. تولید تصاویر پایه با میدجرنی و استیبل دیفیوژن انجام گرفته، سپس با ابزارهای متحرک‌سازی تصاویر به حرکت درآمده و در نهایت در پریمیر تدوین، اصلاح رنگ و صداگذاری شده است تا خروجی فانتزی و خیره‌کننده‌ای در کمترین زمان حاصل شود.",
    tags: ["هوش مصنوعی", "تولید ویدیو مولد", "ایده‌پردازی", "کانسپت آرت"],
    tools: ["میدجرنی", "پریمیر پرو", "افترافکت", "هوش مصنوعی مولد"],
    mediaUrl: "/images/projects/ai-creation.png",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-neural-network-nodes-flashing-and-moving-in-3d-42616-large.mp4",
    client: "پروژه تجربی شخصی",
    year: "۱۴۰۵",
    highlightColor: "#ff6b35"
  }
];
