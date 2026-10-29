import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = getDb();
    const initialLength = db.categories.length;
    db.categories = db.categories.filter(c => c.id !== id);
    
    if (db.categories.length === initialLength) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
    }
    
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف دسته‌بندی" }, { status: 500 });
  }
}
