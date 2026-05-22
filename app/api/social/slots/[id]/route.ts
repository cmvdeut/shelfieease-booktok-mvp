import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/social/db";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!checkSocialAuth(req)) return unauthorized();
  const { id } = await params;
  const body = (await req.json()) as Partial<{
    dayOfWeek: number;
    hour: number;
    minute: number;
    platforms: string[];
    enabled: boolean;
  }>;

  const slot = await prisma.scheduleSlot.update({
    where: { id },
    data: {
      ...(body.dayOfWeek !== undefined && { dayOfWeek: body.dayOfWeek }),
      ...(body.hour !== undefined && { hour: body.hour }),
      ...(body.minute !== undefined && { minute: body.minute }),
      ...(body.platforms !== undefined && { platforms: JSON.stringify(body.platforms) }),
      ...(body.enabled !== undefined && { enabled: body.enabled }),
    },
  });

  return NextResponse.json({
    ...slot,
    platforms: JSON.parse(slot.platforms),
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!checkSocialAuth(_req)) return unauthorized();
  const { id } = await params;
  await prisma.scheduleSlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
