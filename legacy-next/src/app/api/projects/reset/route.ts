import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { projectsData } from "@/data/projects";
import { isAuthorized } from "@/lib/auth";

const DEFAULT_CATEGORIES = [
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

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  try {
    // Get current DB to preserve settings and timeline during reset
    const currentDb = getDb();
    const initialData = {
      projects: projectsData.map(p => ({
        ...p,
        visible: true,
        featured: false
      })),
      categories: DEFAULT_CATEGORIES,
      settings: currentDb.settings,
      timeline: currentDb.timeline,
    };
    saveDb(initialData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ریست دیتابیس" }, { status: 500 });
  }
}
