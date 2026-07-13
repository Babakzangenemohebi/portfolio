import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const updates = await req.json();
    const db = getDb();
    
    const index = db.timeline.findIndex(t => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "آیتم زمانی یافت نشد" }, { status: 404 });
    }
    
    db.timeline[index] = { ...db.timeline[index], ...updates };
    saveDb(db);
    
    return NextResponse.json({ success: true, item: db.timeline[index] });
  } catch (error) {
    return NextResponse.json({ error: "داده‌های نامعتبر" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = getDb();
    const initialLength = db.timeline.length;
    db.timeline = db.timeline.filter(t => t.id !== id);
    
    if (db.timeline.length === initialLength) {
      return NextResponse.json({ error: "آیتم زمانی یافت نشد" }, { status: 404 });
    }
    
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف آیتم زمانی" }, { status: 500 });
  }
}
