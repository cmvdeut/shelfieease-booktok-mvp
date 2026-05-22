#!/usr/bin/env node
/**
 * Copy juni reel Pilars → public/videos for shelfieease.app URLs (Zernio / IG API).
 * Run: node scripts/sync-pilars-to-public.js
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const pilarsDir = path.join(repoRoot, "TikTok", "Pilars");
const outDir = path.join(repoRoot, "public", "videos");

const MAP = [
  ["(15) Double Buy.mp4", "pilar-double-buy.mp4"],
  ["(64) Sharing.mp4", "pilar-sharing.mp4"],
  ["(49) visula light.mp4", "pilar-visual-light.mp4"],
  ["(43)scattered reading.mp4", "pilar-scattered-reading.mp4"],
  ["(114) Calm Relief.mp4", "pilar-calm-relief.mp4"],
  ["(19) one system.mp4", "pilar-one-system.mp4"],
  ["(107) Cluster stress.mp4", "pilar-cluster-stress.mp4"],
  ["(156) stop over-organizing.mp4", "pilar-stop-overorganizing.mp4"],
  ["Video 1 - Identity.mp4", "pilar-identity.mp4"],
];

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const [src, dest] of MAP) {
  const from = path.join(pilarsDir, src);
  const to = path.join(outDir, dest);
  if (!fs.existsSync(from)) {
    console.warn("SKIP (missing):", src);
    continue;
  }
  if (fs.existsSync(to)) {
    const a = fs.statSync(from);
    const b = fs.statSync(to);
    if (a.size === b.size) {
      console.log("OK (exists):", dest);
      continue;
    }
  }
  console.log("Copy:", src, "→", dest);
  fs.copyFileSync(from, to);
}

console.log("Done. Deploy public/videos/ for live URLs.");
