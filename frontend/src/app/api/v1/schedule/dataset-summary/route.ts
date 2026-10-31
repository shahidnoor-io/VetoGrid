import { NextResponse } from "next/server";
import citData from "@/data/cit_public.json";

export async function GET() {
  const d = citData as any;
  return NextResponse.json({
    institution: d.institution_name || "Chitkara Institute of Technology",
    semester: d.academic_term || "Week 7 (Spectra & Midsems)",
    rooms_count: d.rooms?.length || 27,
    faculty_count: d.faculty?.length || 40,
    courses_count: d.courses?.length || 38,
    student_groups_count: d.student_groups?.length || 14,
    sessions_count: d.curriculum_sessions?.length || 189,
    exams_count: d.midsem_exams?.length || 41,
    venue_requests_count: d.venue_requests?.length || 25,
  });
}
