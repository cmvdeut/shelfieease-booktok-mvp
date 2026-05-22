import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/social/db";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";
import { findNextFreeSlot } from "@/lib/social/scheduler";

export async function GET(req: NextRequest) {
  if (!checkSocialAuth(req)) return unauthorized();
  const status = req.nextUrl.searchParams.get("status");
  const posts = await prisma.post.findMany({
    where: status ? { status } : undefined,
    orderBy: { scheduledAt: "asc" },
    include: { publishLogs: { orderBy: { createdAt: "desc" }, take: 3 } },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!checkSocialAuth(req)) return unauthorized();
  const body = (await req.json()) as {
    platform: string;
    format?: string;
    caption: string;
    captionPreview?: string;
    mediaPath?: string;
    scheduledAt?: string;
    useNextFreeSlot?: boolean;
    manualOnly?: boolean;
    locale?: string;
    campaign?: string;
  };

  let scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : new Date();

  if (body.useNextFreeSlot && body.platform) {
    const slots = await prisma.scheduleSlot.findMany({ where: { enabled: true } });
    const occupied = await prisma.post.findMany({
      where: { status: { in: ["scheduled", "publishing"] } },
      select: { scheduledAt: true, platform: true },
    });
    const next = findNextFreeSlot(
      slots.map((s) => ({
        ...s,
        platforms: JSON.parse(s.platforms) as string[],
      })),
      body.platform,
      occupied.map((o) => ({ scheduledAt: o.scheduledAt, platform: o.platform }))
    );
    if (next) scheduledAt = next;
  }

  const manualOnly =
    body.manualOnly ||
    body.format === "carousel" ||
    body.format === "story" ||
    !body.mediaPath;

  const post = await prisma.post.create({
    data: {
      platform: body.platform,
      format: body.format || "reel",
      status: manualOnly ? "skipped" : "scheduled",
      scheduledAt,
      caption: body.caption,
      captionPreview: body.captionPreview || null,
      mediaPath: body.mediaPath || null,
      manualOnly,
      locale: body.locale || null,
      campaign: body.campaign || null,
    },
  });

  return NextResponse.json(post);
}
