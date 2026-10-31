import { NextRequest, NextResponse } from "next/server";
import { DEMO_ROLES } from "@/lib/auth-constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanEmail = (body.email || "").trim().toLowerCase();

    const matched =
      DEMO_ROLES.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail ||
          u.id.toLowerCase() === cleanEmail ||
          u.role.toLowerCase() === cleanEmail ||
          u.label.toLowerCase() === cleanEmail
      ) || DEMO_ROLES[0];

    const userPayload = {
      userId: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
      label: matched.label,
      badge: matched.badge,
      department: matched.department,
      canApprove: matched.canApprove,
      canChangePriority: matched.canChangePriority,
      canGenerateTimetable: matched.canGenerateTimetable,
      canMoveClasses: matched.canMoveClasses,
    };

    const token = Buffer.from(JSON.stringify(userPayload)).toString("base64");

    let redirectTo = "/dashboard";
    if (matched.role === "Faculty" || matched.role === "faculty") {
      redirectTo = "/timetable";
    } else if (
      matched.role === "Club representative" ||
      matched.role === "student_representative"
    ) {
      redirectTo = "/venue-bookings";
    }

    const res = NextResponse.json({
      success: true,
      user: userPayload,
      redirectTo,
    });

    res.cookies.set("campusos_session", token, {
      maxAge: 28800,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false, // Ensures session persists cleanly on both HTTP (localhost) and HTTPS (Vercel)
    });

    return res;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Invalid request payload." },
      { status: 400 }
    );
  }
}
