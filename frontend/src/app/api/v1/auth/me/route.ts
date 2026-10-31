import { NextRequest, NextResponse } from "next/server";
import { DEMO_ROLES } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("campusos_session");
  if (!cookie?.value) {
    return NextResponse.json(
      { success: false, message: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const raw = Buffer.from(cookie.value, "base64").toString("utf-8");
    const user = JSON.parse(raw);
    return NextResponse.json({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid session." },
      { status: 401 }
    );
  }
}
