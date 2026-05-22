import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/social/db";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";

export async function GET(req: NextRequest) {
  if (!checkSocialAuth(req)) return unauthorized();
  const slots = await prisma.scheduleSlot.findMany({ orderBy: [{ dayOfWeek: "asc" }, { hour: "asc" }] });
  return NextResponse.json(
    slots.map((s) => ({
      ...s,
      platforms: JSON.parse(s.platforms) as string[],
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!checkSocialAuth(req)) return unauthorized();
  const body = (await req.json()) as {
    dayOfWeek: number;
    hour: number;
    minute: number;
    timezone?: string;
    platforms: string[];
    enabled?: boolean;
  };

  const slot = await prisma.scheduleSlot.create({
    data: {
      dayOfWeek: body.dayOfWeek,
      hour: body.hour,
      minute: body.minute,
      timezone: body.timezone || "Europe/Amsterdam",
      platforms: JSON.stringify(body.platforms),
      enabled: body.enabled ?? true,
    },
  });

  return NextResponse.json({
    ...slot,
    platforms: JSON.parse(slot.platforms),
  });
}
