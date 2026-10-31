import { NextRequest, NextResponse } from "next/server";
import { DEMO_ROLES } from "@/lib/auth-constants";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("campusos_session");
  if (!cookie?.value) {
    // Return default first role info if unauthenticated so client can gracefully display preview
    return NextResponse.json({
      success: true,
      authenticated: false,
      user: {
        userId: DEMO_ROLES[0].id,
        email: DEMO_ROLES[0].email,
        name: DEMO_ROLES[0].name,
        role: DEMO_ROLES[0].role,
        department: DEMO_ROLES[0].department,
      },
    });
  }

  try {
    const raw = Buffer.from(cookie.value, "base64").toString("utf-8");
    const user = JSON.parse(raw);
    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid session." },
      { status: 401 }
    );
  }
}
