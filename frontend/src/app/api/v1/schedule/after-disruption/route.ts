import { NextResponse } from "next/server";
import scheduleAfterData from "@/data/schedule_after.json";

export async function GET() {
  return NextResponse.json(scheduleAfterData);
}

