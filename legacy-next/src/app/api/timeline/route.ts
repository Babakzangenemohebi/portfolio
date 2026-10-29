import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.timeline);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  try {
    const item = await req.json();
    const db = getDb();
    
    const newItem = {
      ...item,
      id: `time-${Date.now()}`
    };
    
    db.timeline = [newItem, ...db.timeline];
    saveDb(db);
    
    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    return NextResponse.json({ error: "داده‌های نامعتبر" }, { status: 400 });
  }
}
