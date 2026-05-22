import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/social/db";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!checkSocialAuth(req)) return unauthorized();
  const { id } = await params;
  const body = (await req.json()) as Partial<{
    status: string;
    scheduledAt: string;
    caption: string;
    mediaPath: string;
    manualOnly: boolean;
    format: string;
  }>;

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.scheduledAt !== undefined && { scheduledAt: new Date(body.scheduledAt) }),
      ...(body.caption !== undefined && { caption: body.caption }),
      ...(body.mediaPath !== undefined && { mediaPath: body.mediaPath }),
      ...(body.manualOnly !== undefined && { manualOnly: body.manualOnly }),
      ...(body.format !== undefined && { format: body.format }),
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!checkSocialAuth(_req)) return unauthorized();
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
