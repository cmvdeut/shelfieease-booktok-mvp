#!/usr/bin/env node
/**
 * Reads scheduled-posts.json and writes public/tiktok-data.json
 * for the TikTok Caption Helper page (shelfieease.app/tiktok).
 * Run after editing scheduled-posts.json:  node scripts/generate-tiktok-data.js
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const queuePath = path.join(repoRoot, "scheduled-posts.json");
const outPath = path.join(repoRoot, "public", "tiktok-data.json");

const raw = fs.readFileSync(queuePath, "utf-8");
const queue = JSON.parse(raw);
const tiktokPosts = queue.filter((p) => p.platform === "tiktok");

const pending = tiktokPosts[0] || null;
const upcoming = tiktokPosts.slice(1);
const updated_at = Math.floor(Date.now() / 1000);

const data = {
  pending,
  upcoming,
  updated_at,
};

fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
console.log("Written public/tiktok-data.json (pending: %s, upcoming: %d)", pending ? pending.scheduled_label : "none", upcoming.length);
