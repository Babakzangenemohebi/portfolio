import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username === "babak" && password === "babak") {
      return NextResponse.json({ success: true, token: AUTH_TOKEN });
    }

    return NextResponse.json(
      { success: false, error: "نام کاربری یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
}
