import { NextRequest, NextResponse } from "next/server";
import { DEMO_ROLES } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cleanEmail = (body.email || "").trim().toLowerCase();

    const matched = DEMO_ROLES.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.id.toLowerCase() === cleanEmail ||
        u.role.toLowerCase() === cleanEmail
    ) || DEMO_ROLES[0];

    const userPayload = {
      userId: matched.id,
      email: matched.email,
      name: matched.name,
      role: matched.role,
      department: matched.department,
    };

    const token = Buffer.from(JSON.stringify(userPayload)).toString("base64");

    const res = NextResponse.json({
      success: true,
      user: userPayload,
      redirectTo: "/dashboard",
    });

    res.cookies.set("campusos_session", token, {
      maxAge: 28800,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 }
    );
  }
}
