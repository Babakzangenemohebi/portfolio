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
    
    const index = db.projects.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "پروژه یافت نشد" }, { status: 404 });
    }
    
    db.projects[index] = { ...db.projects[index], ...updates };
    saveDb(db);
    
    return NextResponse.json({ success: true, project: db.projects[index] });
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
    const initialLength = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== id);
    
    if (db.projects.length === initialLength) {
      return NextResponse.json({ error: "پروژه یافت نشد" }, { status: 404 });
    }
    
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف پروژه" }, { status: 500 });
  }
}
