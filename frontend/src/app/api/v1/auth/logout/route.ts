import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  res.cookies.set("campusos_session", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
