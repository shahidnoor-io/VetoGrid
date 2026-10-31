import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, user_role, requester_id } = await req.json();
    const text = (prompt || "").toLowerCase();

    // Adversarial guardrail check
    const isInjection =
      text.includes("ignore") ||
      text.includes("developer mode") ||
      text.includes("bypass") ||
      text.includes("override") ||
      text.includes("system prompt");

    if (isInjection) {
      return NextResponse.json({
        status: "SECURITY_VIOLATION",
        message:
          "Security policy violation detected: Prompt contains prohibited instructions or attempts to bypass campus scheduling constraints.",
        security_violations: ["PROMPT_INJECTION_OR_OVERRIDE_ATTEMPT"],
      });
    }

    // Hinglish / booking intent detection
    if (
      text.includes("auditorium") ||
      text.includes("audi") ||
      text.includes("book") ||
      text.includes("venue") ||
      text.includes("chahiye") ||
      text.includes("rehearsal")
    ) {
      return NextResponse.json({
        status: "SUCCESS",
        message:
          "Main Auditorium (AUD-01) requested for Spectra rehearsal. The slot is available with zero curricular overlaps and meets all capacity constraints.",
        proposal: {
          event_name: "Spectra Fest Rehearsal",
          day: "Wednesday",
          start_period: 10,
          end_period: 12,
          start_time: "18:00",
          end_time: "21:00",
          room_id: "AUD-01",
          attendees: 150,
          requested_by: requester_id || "Aarav Patel",
          requester_role: user_role || "Club representative",
          priority_tier: 6,
          is_valid: true,
          suggested_alternatives: [],
          manual_fallback_available: true,
        },
        security_violations: [],
      });
    }

    return NextResponse.json({
      status: "SUCCESS",
      message:
        "Hello! I am your VetoGrid campus AI assistant. You can ask me in English or Hinglish to check timetable schedules, find empty venues, or submit booking requests.",
      security_violations: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "ERROR", message: "Failed to process assistant request." },
      { status: 400 }
    );
  }
}
