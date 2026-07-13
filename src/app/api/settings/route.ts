import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.settings);
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  try {
    const updates = await req.json();
    const db = getDb();
    db.settings = { ...db.settings, ...updates };
    saveDb(db);
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (error) {
    return NextResponse.json({ error: "داده‌های نامعتبر" }, { status: 400 });
  }
}
