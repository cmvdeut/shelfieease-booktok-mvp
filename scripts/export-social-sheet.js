#!/usr/bin/env node
/**
 * Export planning sheet + Zernio bulk CSV from scheduled-posts.json
 * Run: node scripts/export-social-sheet.js
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const queuePath = path.join(repoRoot, "scheduled-posts.json");
const baseUrl = "https://www.shelfieease.app";
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

function csvEscape(val) {
  const s = val == null ? "" : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(cols) {
  return cols.map(csvEscape).join(",") + "\n";
}

function mediaUrl(videoFile) {
  if (!videoFile) return "";
  const rel = videoFile.replace(/^public\//, "");
  return `${baseUrl}/${rel}`;
}

function toIso(unix) {
  return new Date(unix * 1000).toISOString();
}

// --- Planning sheet (Google Sheets / Excel) ---
const planHeader = [
  "dag",
  "gepland_label",
  "platform",
  "formaat",
  "handmatig",
  "video_bestand",
  "media_url",
  "caption_preview",
  "zernio_ig",
  "zernio_tiktok",
  "live_gepost",
  "permalink",
  "notities",
];

let planBody = row(planHeader);

for (const p of queue) {
  const isReel = p.post_format === "reel" && p.video_file;
  planBody += row([
    p.calendar_day,
    p.scheduled_label,
    p.platform,
    p.post_format,
    p.manual ? "ja" : "nee",
    p.video_file || "",
    mediaUrl(p.video_file),
    p.caption_preview || "",
    "", // zernio_ig — invullen: gepland / live / skip
    isReel ? "" : "n.v.t.", // zernio_tiktok — reels: leeg; rest n.v.t.
    "", // live_gepost
    "", // permalink
    p.manual && p.post_format !== "reel" ? "Alleen handmatig in app" : "",
  ]);
}

const planPath = path.join(repoRoot, "docs", "social-posts-planning.csv");
fs.writeFileSync(planPath, "\uFEFF" + planBody, "utf8");

// --- Zernio bulk (reels met video; IG + TikTok kolommen) ---
const zernioHeader = [
  "content",
  "scheduledFor",
  "timezone",
  "instagram",
  "tiktok",
  "mediaUrls",
  "instagram_first_comment",
  "tiktok_first_comment",
  "notes",
];

let zernioBody = row(zernioHeader);
const firstComment =
  "Gratis proberen in je browser — link in bio 👆";

for (const p of queue) {
  if (p.post_format !== "reel" || !p.video_file) continue;
  const caption = (p.caption || p.caption_preview || "").replace(/\r\n/g, "\n");
  zernioBody += row([
    caption,
    toIso(p.scheduled_time_unix),
    "Europe/Amsterdam",
    "true",
    "true",
    mediaUrl(p.video_file),
    firstComment,
    firstComment,
    `dag ${p.calendar_day} · ${p.campaign || "jun2026"}`,
  ]);
}

const zernioPath = path.join(repoRoot, "docs", "zernio-bulk-juni2026.csv");
fs.writeFileSync(zernioPath, zernioBody, "utf8");

console.log("Written:", planPath);
console.log("Written:", zernioPath);
console.log(
  "Planning rows:",
  queue.length,
  "| Zernio reel rows:",
  queue.filter((p) => p.post_format === "reel" && p.video_file).length
);
