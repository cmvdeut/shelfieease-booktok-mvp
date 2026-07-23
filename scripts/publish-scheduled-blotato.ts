/**
 * Publiceert due posts uit scheduled-posts.json via de Blotato API.
 *
 * Vervangt de oude GitHub Actions workflow (direct naar TikTok/Instagram API's,
 * uitgeschakeld sinds mei 2026) en de lokale social-worker als primaire publish-pad.
 * Leest scheduled-posts.json (de kalender die actief wordt bijgehouden), publiceert
 * elke post waarvan scheduled_time_unix voorbij is en status nog niet "published"/"failed"
 * is, en logt het resultaat terug naar scheduled-posts.json + social-posts-log.md.
 *
 * Vereisten:
 *   1. BLOTATO_API_KEY (via my.blotato.com → Settings → API)
 *   2. TikTok + Instagram gekoppeld in Blotato dashboard
 *   3. Optioneel: BLOTATO_TIKTOK_USERNAME / BLOTATO_INSTAGRAM_USERNAME om het
 *      juiste gekoppelde account te kiezen als er meerdere zijn
 *
 * Gebruik:
 *   npm run social:publish-blotato
 */

import fs from "fs";
import path from "path";

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { config } = require("dotenv");
  config({ path: ".env.local" });
} catch {
  // dotenv niet geïnstalleerd — gebruik process.env direct
}

const BLOTATO_API = "https://backend.blotato.com/v2";
const ROOT_DIR = process.cwd();

// Platforms waarvoor automatisch publiceren (via deze workflow) is UITGESCHAKELD.
// TikTok uit sinds 2026-07-23: @shelfieease zit in soft-suppression (For You = 0%).
// Zolang dat speelt posten we NIET automatisch/via API naar TikTok — post native in
// de app. Geblokkeerde posts blijven "pending" en hervatten zodra je dit weer leegmaakt.
// Let op: dit raakt alleen de queue van DEZE repo (ShelfieEase). Posts die direct in de
// Blotato-kalender staan gepland moet je in de Blotato-UI annuleren. SeniorEase draait
// in een aparte repo en wordt hier niet geraakt.
const DISABLED_PLATFORMS = new Set<string>(["tiktok"]);
const SCHEDULE_PATH = path.join(ROOT_DIR, "scheduled-posts.json");
const LOG_PATH = path.join(ROOT_DIR, "social-posts-log.md");

interface BlotatoAccount {
  id: string;
  username?: string;
  fullname?: string;
}

interface ScheduledPost {
  platform: "tiktok" | "instagram";
  locale: string;
  campaign: string;
  post_format: string;
  calendar_day: number;
  scheduled_time_unix: number;
  scheduled_label: string;
  video_file?: string;
  caption_preview: string;
  caption: string;
  status?: "pending" | "published" | "failed";
  blotatoPostId?: string;
  publishedAt?: string;
  error?: string;
}

function loadSchedule(): ScheduledPost[] {
  return JSON.parse(fs.readFileSync(SCHEDULE_PATH, "utf-8"));
}

function saveSchedule(posts: ScheduledPost[]): void {
  fs.writeFileSync(SCHEDULE_PATH, JSON.stringify(posts, null, 2) + "\n", "utf-8");
}

function appendToLog(post: ScheduledPost, outcome: "gepubliceerd" | "mislukt"): void {
  const now = new Date();
  const timestamp = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const platformLabel = post.platform === "tiktok" ? "TikTok" : "Instagram";

  const rows = [
    `| Datum | ${timestamp} |`,
    `| Platform | ${platformLabel} |`,
    `| Gepland voor | ${post.scheduled_label} |`,
    `| Video | ${post.video_file} |`,
    `| Caption | ${post.caption_preview} |`,
    outcome === "gepubliceerd"
      ? `| Status | Gepubliceerd via Blotato${post.blotatoPostId ? ` (ID: ${post.blotatoPostId})` : ""} |`
      : `| Status | Mislukt — ${post.error ?? "onbekende fout"} |`,
  ];

  const block = [
    `## ${timestamp} — ${platformLabel} (${outcome})`,
    "| Field | Value |",
    "|-------|-------|",
    ...rows,
    "",
    "---",
    "",
  ].join("\n");

  fs.appendFileSync(LOG_PATH, "\n" + block, "utf-8");
}

async function getAccountId(apiKey: string, platform: string): Promise<string> {
  const res = await fetch(`${BLOTATO_API}/users/me/accounts?platform=${platform}`, {
    headers: { "blotato-api-key": apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Accounts ophalen mislukt (${platform}): ${res.status} — ${text}`);
  }
  const data = (await res.json()) as { items?: BlotatoAccount[] };
  const items: BlotatoAccount[] = data.items ?? [];
  if (items.length === 0)
    throw new Error(`Geen ${platform}-account gevonden in Blotato. Koppel het account via my.blotato.com.`);

  const envKey = platform === "tiktok" ? "BLOTATO_TIKTOK_USERNAME" : "BLOTATO_INSTAGRAM_USERNAME";
  const preferred = process.env[envKey]?.toLowerCase();
  const account = preferred
    ? items.find((a) => a.username?.toLowerCase() === preferred) ?? items[0]
    : items[0];

  console.log(`   🔗 ${platform}: ${account.fullname || account.username} (${account.id})`);
  return account.id as string;
}

async function uploadMedia(apiKey: string, videoPath: string): Promise<string> {
  const fileName = path.basename(videoPath);
  const fileSize = fs.statSync(videoPath).size;
  console.log(`   📤 Uploaden: ${fileName} (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

  const initRes = await fetch(`${BLOTATO_API}/media/uploads`, {
    method: "POST",
    headers: { "blotato-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: fileName, contentType: "video/mp4" }),
  });
  if (!initRes.ok) {
    const text = await initRes.text();
    throw new Error(`Upload init mislukt: ${initRes.status} — ${text}`);
  }

  const { presignedUrl, publicUrl } = (await initRes.json()) as { presignedUrl: string; publicUrl: string };
  const videoBuffer = fs.readFileSync(videoPath);
  const putRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(fileSize) },
    body: videoBuffer,
  });
  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`Video PUT mislukt: ${putRes.status} — ${text}`);
  }

  console.log(`   ✅ Geüpload → ${publicUrl}`);
  return publicUrl as string;
}

/**
 * Instagram weigert posts met meer dan 5 hashtags (HTTP 422), en de brand-regel is
 * sowieso max 5 hashtags op elk platform. Houdt de eerste `max` hashtags aan en
 * verwijdert de rest, en ruimt de achtergebleven witruimte op.
 */
function capHashtags(text: string, max = 5): string {
  let count = 0;
  return text
    .replace(/#[\p{L}\p{N}_]+/gu, (tag) => (++count <= max ? tag : ""))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

async function publishNow(
  apiKey: string,
  accountId: string,
  post: ScheduledPost,
  mediaUrl: string
): Promise<string> {
  const target =
    post.platform === "tiktok"
      ? {
          targetType: "tiktok",
          privacyLevel: "PUBLIC_TO_EVERYONE",
          isAiGenerated: false,
          disabledComments: false,
          disabledDuet: false,
          disabledStitch: false,
          isBrandedContent: false,
          isYourBrand: false,
        }
      : {
          targetType: "instagram",
          mediaType: "reel",
          shareToFeed: true,
        };

  const body = {
    post: {
      accountId,
      content: {
        text: capHashtags(post.caption, 5),
        mediaUrls: [mediaUrl],
        platform: post.platform,
      },
      target,
    },
  };

  const res = await fetch(`${BLOTATO_API}/posts`, {
    method: "POST",
    headers: { "blotato-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Post publiceren mislukt: ${res.status} — ${text}`);
  }

  const data = (await res.json()) as { postSubmissionId?: string; id?: string };
  const postId = data.postSubmissionId ?? data.id ?? "?";
  console.log(`   ✅ Gepubliceerd (ID: ${postId})`);
  return String(postId);
}

async function main() {
  const apiKey = process.env.BLOTATO_API_KEY;
  if (!apiKey) {
    console.error("❌ BLOTATO_API_KEY ontbreekt in .env\n   Haal je key op via: my.blotato.com → Settings → API");
    process.exit(1);
  }

  const posts = loadSchedule();
  const nowUnix = Math.floor(Date.now() / 1000);
  const due = posts.filter(
    (p) => p.scheduled_time_unix <= nowUnix && p.status !== "published" && p.status !== "failed"
  );

  if (due.length === 0) {
    console.log("ℹ️  Geen due posts gevonden in scheduled-posts.json.");
    return;
  }

  const blocked = due.filter((p) => DISABLED_PLATFORMS.has(p.platform));
  if (blocked.length > 0) {
    console.log(
      `⏸️  ${blocked.length} post(s) overgeslagen — platform uitgeschakeld: ${[...DISABLED_PLATFORMS].join(", ")} (blijven pending).`
    );
  }
  const active = due.filter((p) => !DISABLED_PLATFORMS.has(p.platform));

  if (active.length === 0) {
    console.log("ℹ️  Geen publiceerbare due posts (alle due posts staan op een uitgeschakeld platform).");
    return;
  }

  console.log(`\n📅 Blotato publiceren — ${active.length} due post(s)\n`);
  console.log("🔍 Account IDs ophalen...");

  const platforms = [...new Set(active.map((p) => p.platform))];
  const accountIds = new Map<string, string>();
  for (const platform of platforms) {
    accountIds.set(platform, await getAccountId(apiKey, platform));
  }

  const uploadCache = new Map<string, string>();
  let published = 0;
  let failed = 0;

  for (const post of active) {
    console.log(`\n→ ${post.platform.toUpperCase()} | ${post.scheduled_label}`);
    console.log(`  Caption: ${post.caption_preview}`);

    try {
      if (!post.video_file) {
        throw new Error(
          "Geen video_file opgegeven — carrousel/afbeelding-posts worden (nog) niet ondersteund door dit script."
        );
      }

      let mediaUrl: string;
      if (uploadCache.has(post.video_file)) {
        mediaUrl = uploadCache.get(post.video_file)!;
        console.log(`   ♻️  Hergebruik upload: ${mediaUrl}`);
      } else {
        const videoPath = path.join(ROOT_DIR, post.video_file);
        if (!fs.existsSync(videoPath)) {
          throw new Error(`Video niet gevonden: ${videoPath}`);
        }
        mediaUrl = await uploadMedia(apiKey, videoPath);
        uploadCache.set(post.video_file, mediaUrl);
      }

      const postId = await publishNow(apiKey, accountIds.get(post.platform)!, post, mediaUrl);
      post.status = "published";
      post.blotatoPostId = postId;
      post.publishedAt = new Date().toISOString();
      appendToLog(post, "gepubliceerd");
      published++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Fout: ${message}`);
      post.status = "failed";
      post.error = message;
      appendToLog(post, "mislukt");
      failed++;
    }
  }

  saveSchedule(posts);
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Gepubliceerd: ${published}   ❌ Mislukt: ${failed}`);
  console.log(`📄 scheduled-posts.json en social-posts-log.md bijgewerkt`);
  console.log(`🔗 Kalender: https://my.blotato.com/calendar`);
}

main().catch((err) => {
  console.error("❌ Onverwachte fout:", err);
  process.exit(1);
});
