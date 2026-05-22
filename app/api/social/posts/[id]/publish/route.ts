import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/social/db";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";
import { publishPost } from "@/lib/social/publish";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!checkSocialAuth(req)) return unauthorized();
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!post.mediaPath) {
    return NextResponse.json({ error: "No media (manual post)" }, { status: 400 });
  }

  await prisma.post.update({
    where: { id },
    data: { status: "publishing", error: null },
  });

  const attempt = (await prisma.publishLog.count({ where: { postId: id } })) + 1;

  try {
    const result = await publishPost({
      platform: post.platform as "tiktok" | "instagram",
      caption: post.caption,
      mediaPath: post.mediaPath,
    });

    await prisma.publishLog.create({
      data: {
        postId: id,
        attempt,
        success: result.success,
        message: result.message,
        raw: result.raw ? JSON.stringify(result.raw) : null,
      },
    });

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: result.success ? "published" : "failed",
        permalink: result.permalink || null,
        error: result.success ? null : result.message,
      },
    });

    return NextResponse.json({ result, post: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.publishLog.create({
      data: { postId: id, attempt, success: false, message: msg },
    });
    await prisma.post.update({
      where: { id },
      data: { status: "failed", error: msg },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
