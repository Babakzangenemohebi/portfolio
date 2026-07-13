import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { isAuthorized } from "@/lib/auth";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.projects);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
  }

  try {
    const project = await req.json();
    const db = getDb();
    
    const newProject = {
      ...project,
      id: `project-${Date.now()}`
    };
    
    db.projects = [newProject, ...db.projects];
    saveDb(db);
    
    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    return NextResponse.json({ error: "داده‌های نامعتبر" }, { status: 400 });
  }
}
