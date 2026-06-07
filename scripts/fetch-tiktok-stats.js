#!/usr/bin/env node
/**
 * Fetches TikTok video analytics for ShelfieEase.
 * Shows views, likes, comments, shares per video — sorted best first.
 *
 * Usage:
 *   node scripts/fetch-tiktok-stats.js
 *
 * Token resolution order:
 *   1. TIKTOK_ACCESS_TOKEN env var
 *   2. .env.local in project root
 *   3. Prompts with re-auth instructions if no token found
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── Token resolution ──────────────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const envLocal = loadEnvLocal();

function env(key) {
  return process.env[key] || envLocal[key] || "";
}

const accessToken = env("TIKTOK_ACCESS_TOKEN");
const refreshToken = env("TIKTOK_REFRESH_TOKEN");
const clientKey = env("TIKTOK_CLIENT_KEY");
const clientSecret = env("TIKTOK_CLIENT_SECRET");

if (!accessToken && !refreshToken) {
  console.error(`
❌  Geen TikTok token gevonden.

Zet je token in .env.local:
  TIKTOK_ACCESS_TOKEN=your_access_token

Of als env var:
  TIKTOK_ACCESS_TOKEN=xxx node scripts/fetch-tiktok-stats.js

Je kunt ook TIKTOK_REFRESH_TOKEN + TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET
instellen zodat het script de token automatisch vernieuwt.
`);
  process.exit(1);
}

// ── Token refresh ─────────────────────────────────────────────────────────────

async function refreshAccessToken() {
  if (!refreshToken || !clientKey || !clientSecret) return null;
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  return data.access_token || null;
}

// ── TikTok video query ────────────────────────────────────────────────────────

const FIELDS = [
  "id",
  "title",
  "like_count",
  "view_count",
  "comment_count",
  "share_count",
  "create_time",
].join(",");

async function fetchVideos(token) {
  const res = await fetch(
    `https://open.tiktokapis.com/v2/video/list/?fields=${encodeURIComponent(FIELDS)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );

  const data = await res.json();
  return data;
}

// ── Formatting ─────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === undefined || n === null) return "–";
  return n.toLocaleString("nl-NL");
}

function truncate(str, max = 45) {
  if (!str) return "(geen titel)";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function formatDate(timestamp) {
  if (!timestamp) return "–";
  return new Date(timestamp * 1000).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function printTable(videos) {
  const sorted = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

  console.log("\n📊  ShelfieEase — TikTok Video Stats (gesorteerd op views)\n");

  const header = [
    "Rank".padEnd(5),
    "Titel".padEnd(47),
    "Views".padStart(8),
    "Likes".padStart(7),
    "Comments".padStart(10),
    "Shares".padStart(8),
    "Datum".padStart(12),
  ].join("  ");

  console.log(header);
  console.log("─".repeat(header.length));

  sorted.forEach((v, i) => {
    console.log(
      [
        `#${i + 1}`.padEnd(5),
        truncate(v.title).padEnd(47),
        fmt(v.view_count).padStart(8),
        fmt(v.like_count).padStart(7),
        fmt(v.comment_count).padStart(10),
        fmt(v.share_count).padStart(8),
        formatDate(v.create_time).padStart(12),
      ].join("  ")
    );
  });

  console.log("─".repeat(header.length));

  const totalViews = sorted.reduce((s, v) => s + (v.view_count || 0), 0);
  const totalLikes = sorted.reduce((s, v) => s + (v.like_count || 0), 0);
  const best = sorted[0];

  console.log(`\n✅  Totaal: ${videos.length} video's`);
  console.log(`👁   Totaal views : ${fmt(totalViews)}`);
  console.log(`❤️   Totaal likes : ${fmt(totalLikes)}`);
  if (best) {
    console.log(`\n🏆  Beste video  : "${truncate(best.title, 60)}"`);
    console.log(`    Views: ${fmt(best.view_count)}  |  Likes: ${fmt(best.like_count)}  |  Datum: ${formatDate(best.create_time)}`);
  }
  console.log();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("⏳  TikTok stats ophalen...");

  // Try to refresh token first (gets fresh access_token)
  let token = accessToken;
  if (refreshToken && clientKey && clientSecret) {
    console.log("🔄  Token vernieuwen...");
    const fresh = await refreshAccessToken();
    if (fresh) {
      token = fresh;
      console.log("✅  Token vernieuwd.");
    }
  }

  if (!token) {
    console.error("❌  Geen geldig access token beschikbaar.");
    process.exit(1);
  }

  const data = await fetchVideos(token);

  // Handle errors
  if (data.error?.code) {
    const code = data.error.code;
    const msg = data.error.message || "";

    if (code === "access_token_invalid" || code === "ok_session_expired") {
      console.error(`
❌  Token verlopen of ongeldig (${code}).

Vernieuw het token via de TikTok OAuth flow:
  1. Open de OAuth URL in een incognito venster
  2. Kopieer de nieuwe access/refresh token
  3. Sla op in .env.local of GitHub Secrets
`);
    } else if (code.includes("scope") || msg.toLowerCase().includes("scope") || code === "permission_denied") {
      console.error(`
❌  Scope-fout (${code}): video.list is niet goedgekeurd voor deze app.

TikTok staat video.list niet toe voor intern/eigen gebruik.
Bekijk je stats via TikTok Studio: https://studio.tiktok.com
`);
    } else {
      console.error(`❌  TikTok API fout: ${code} — ${msg}`);
      console.error("Volledige respons:", JSON.stringify(data, null, 2));
    }
    process.exit(1);
  }

  const videos = data.data?.videos || [];

  if (videos.length === 0) {
    console.log("\n📭  Geen video's gevonden. Mogelijk zijn de video's privé of is de scope beperkt.\n");
    return;
  }

  printTable(videos);

  // Handle pagination hint
  if (data.data?.cursor || data.data?.has_more) {
    console.log(
      `ℹ️   Er zijn meer video's beschikbaar (cursor: ${data.data?.cursor}). Pagination nog niet geïmplementeerd.\n`
    );
  }
}

main().catch((err) => {
  console.error("❌  Onverwachte fout:", err.message);
  process.exit(1);
});
