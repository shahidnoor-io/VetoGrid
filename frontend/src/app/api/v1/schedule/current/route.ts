import { NextResponse } from "next/server";
import scheduleData from "@/data/schedule.json";

export async function GET() {
  return NextResponse.json(scheduleData);
}
