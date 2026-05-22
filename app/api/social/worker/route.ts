import { NextRequest, NextResponse } from "next/server";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";
import { publishPost } from "@/lib/social/publish";
import { prisma } from "@/lib/social/db";
import { canAutoPublish } from "@/lib/social/publish";

export async function POST(req: NextRequest) {
  if (!checkSocialAuth(req)) return unauthorized();

  const due = await prisma.post.findMany({
    where: {
      status: "scheduled",
      manualOnly: false,
      scheduledAt: { lte: new Date() },
      mediaPath: { not: null },
    },
    orderBy: { scheduledAt: "asc" },
    take: 3,
  });

  const results: { id: string; success: boolean; message: string }[] = [];

  for (const post of due) {
    if (!canAutoPublish(post.platform as "tiktok" | "instagram", post.format, post.manualOnly)) {
      continue;
    }

    await prisma.post.update({ where: { id: post.id }, data: { status: "publishing" } });
    const attempt = (await prisma.publishLog.count({ where: { postId: post.id } })) + 1;

    try {
      const result = await publishPost({
        platform: post.platform as "tiktok" | "instagram",
        caption: post.caption,
        mediaPath: post.mediaPath!,
      });
      await prisma.publishLog.create({
        data: {
          postId: post.id,
          attempt,
          success: result.success,
          message: result.message,
          raw: result.raw ? JSON.stringify(result.raw) : null,
        },
      });
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: result.success ? "published" : "failed",
          permalink: result.permalink || null,
          error: result.success ? null : result.message,
        },
      });
      results.push({ id: post.id, success: result.success, message: result.message });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await prisma.publishLog.create({
        data: { postId: post.id, attempt, success: false, message: msg },
      });
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "failed", error: msg },
      });
      results.push({ id: post.id, success: false, message: msg });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
