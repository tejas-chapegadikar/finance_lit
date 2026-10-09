import { NextResponse, type NextRequest } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

// Called once an hour by a scheduler (Vercel Cron or any cron service) with
// `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.json(await sendDueReminders());
}
