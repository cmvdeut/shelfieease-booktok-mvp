#!/usr/bin/env node
/**
 * Publish due scheduled posts (run locally every minute or via Task Scheduler).
 * Usage: npx tsx scripts/social-worker.ts [--once]
 */
import { prisma } from "../lib/social/db";
import { publishPost, canAutoPublish } from "../lib/social/publish";

async function processDuePosts(): Promise<number> {
  const due = await prisma.post.findMany({
    where: {
      status: "scheduled",
      manualOnly: false,
      scheduledAt: { lte: new Date() },
      mediaPath: { not: null },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  let processed = 0;

  for (const post of due) {
    if (
      !canAutoPublish(
        post.platform as "tiktok" | "instagram",
        post.format,
        post.manualOnly
      )
    ) {
      continue;
    }

    console.log(`Publishing ${post.id} (${post.platform})…`);
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "publishing", error: null },
    });

    const attempt =
      (await prisma.publishLog.count({ where: { postId: post.id } })) + 1;

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

      console.log(result.success ? "  OK:" : "  FAIL:", result.message);
      processed++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await prisma.publishLog.create({
        data: {
          postId: post.id,
          attempt,
          success: false,
          message: msg,
        },
      });
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "failed", error: msg },
      });
      console.error("  Error:", msg);
      processed++;
    }
  }

  return processed;
}

async function main() {
  const once = process.argv.includes("--once");
  if (once) {
    const n = await processDuePosts();
    console.log(n === 0 ? "No due posts." : `Processed ${n} post(s).`);
    await prisma.$disconnect();
    return;
  }

  console.log("Social worker running (every 60s). Ctrl+C to stop.");
  const tick = async () => {
    try {
      await processDuePosts();
    } catch (e) {
      console.error("Worker tick error:", e);
    }
  };
  await tick();
  setInterval(tick, 60_000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
