#!/usr/bin/env node
/**
 * CLI: publish one post by id or next due from DB.
 * Usage:
 *   npx tsx scripts/social-publish.ts --id=<postId>
 *   npx tsx scripts/social-publish.ts --next
 */
import { publishPost } from "../lib/social/publish";
import { prisma } from "../lib/social/db";

async function main() {
  const args = process.argv.slice(2);
  const idArg = args.find((a) => a.startsWith("--id="))?.split("=")[1];
  const next = args.includes("--next");

  let post;
  if (idArg) {
    post = await prisma.post.findUnique({ where: { id: idArg } });
    if (!post) {
      console.error(`Post not found: ${idArg}`);
      process.exit(1);
    }
  } else if (next) {
    post = await prisma.post.findFirst({
      where: {
        status: "scheduled",
        manualOnly: false,
        scheduledAt: { lte: new Date() },
        mediaPath: { not: null },
      },
      orderBy: { scheduledAt: "asc" },
    });
    if (!post) {
      console.log("No due posts to publish.");
      process.exit(0);
    }
  } else {
    console.error("Usage: npx tsx scripts/social-publish.ts --id=<id> | --next");
    process.exit(1);
  }

  if (!post.mediaPath) {
    console.error("Post has no mediaPath (manual/carousel?)");
    process.exit(1);
  }

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
      mediaPath: post.mediaPath,
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

    console.log(result.success ? "OK" : "FAILED", result.message);
    if (result.permalink) console.log("URL:", result.permalink);
    process.exit(result.success ? 0 : 1);
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
    console.error("Error:", msg);
    process.exit(1);
  }
}

main();
