import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.categories);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  try {
    const category = await req.json();
    const db = getDb();
    
    const newCategory = {
      ...category,
      id: `cat-${Date.now()}`
    };
    
    db.categories = [...db.categories, newCategory];
    saveDb(db);
    
    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    return NextResponse.json({ error: "داده‌های نامعتبر" }, { status: 400 });
  }
}
