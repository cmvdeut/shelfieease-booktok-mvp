#!/usr/bin/env node
/**
 * Seed SQLite from scheduled-posts.json + default schedule slots.
 * Usage: npx tsx scripts/social-seed.ts
 */
import fs from "fs";
import path from "path";
import { prisma } from "../lib/social/db";
import { defaultSlots } from "../lib/social/scheduler";

type JsonPost = {
  platform: string;
  post_format?: string;
  scheduled_time_unix: number;
  scheduled_label?: string;
  video_file?: string;
  caption?: string;
  caption_preview?: string;
  manual?: boolean;
  locale?: string;
  campaign?: string;
  calendar_day?: number;
};

async function main() {
  const repoRoot = process.env.REPO_ROOT || process.cwd();
  const queuePath = path.join(repoRoot, "scheduled-posts.json");

  if (!fs.existsSync(queuePath)) {
    console.error("scheduled-posts.json not found");
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(queuePath, "utf8")) as JsonPost[];

  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    for (const item of queue) {
      const manualOnly =
        Boolean(item.manual) ||
        item.post_format === "carousel" ||
        item.post_format === "story" ||
        !item.video_file;

      await prisma.post.create({
        data: {
          platform: item.platform,
          format: item.post_format || "reel",
          status: manualOnly ? "skipped" : "scheduled",
          scheduledAt: new Date(item.scheduled_time_unix * 1000),
          caption: item.caption || item.caption_preview || "",
          captionPreview: item.caption_preview || null,
          mediaPath: item.video_file || null,
          manualOnly,
          locale: item.locale || null,
          campaign: item.campaign || null,
          calendarDay: item.calendar_day ?? null,
        },
      });
    }
    console.log(`Imported ${queue.length} posts from scheduled-posts.json`);
  } else {
    console.log(`Skipped post import (${existingPosts} posts already in DB)`);
  }

  const slotCount = await prisma.scheduleSlot.count();
  if (slotCount === 0) {
    for (const slot of defaultSlots()) {
      await prisma.scheduleSlot.create({
        data: {
          dayOfWeek: slot.dayOfWeek,
          hour: slot.hour,
          minute: slot.minute,
          timezone: slot.timezone,
          platforms: JSON.stringify(slot.platforms),
          enabled: slot.enabled,
        },
      });
    }
    console.log(`Created ${defaultSlots().length} default schedule slots`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
