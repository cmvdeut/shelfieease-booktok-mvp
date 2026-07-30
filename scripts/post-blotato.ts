/**
 * Blotato Schedule Script voor ShelfieEase
 *
 * Leest een CSV en plant alle "pending" posts in via de Blotato API.
 * Video's worden opgehaald uit public/videos/ — zorg dat de video_filename klopt.
 *
 * Vereisten:
 *   1. BLOTATO_API_KEY in .env (via my.blotato.com → Settings → API)
 *   2. TikTok + Instagram gekoppeld in Blotato dashboard
 *
 * Gebruik:
 *   npm run post:blotato -- --csv content/jun2026-blotato.csv
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
const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");

interface BlotatoRow {
  id: string;
  date: string;
  time_utc: string;
  platform: string;
  video_filename: string;
  caption: string;
  status: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCsv(content: string): BlotatoRow[] {
  const lines = content.trim().split("\n").filter(Boolean);
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj: any = {};
    headers.forEach((h, i) => (obj[h.trim()] = (values[i] ?? "").trim()));
    return obj as BlotatoRow;
  });
}

function writeCsv(rows: BlotatoRow[], filePath: string): void {
  const header = "id,date,time_utc,platform,video_filename,caption,status";
  const lines = rows.map(
    (r) => `${r.id},${r.date},${r.time_utc},${r.platform},${r.video_filename},"${r.caption.replace(/"/g, '""')}",${r.status}`
  );
  fs.writeFileSync(filePath, [header, ...lines].join("\n") + "\n", "utf-8");
}

async function getAccountId(apiKey: string, platform: string): Promise<string> {
  const res = await fetch(`${BLOTATO_API}/users/me/accounts?platform=${platform}`, {
    headers: { "blotato-api-key": apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Accounts ophalen mislukt (${platform}): ${res.status} — ${text}`);
  }
  const data = (await res.json()) as any;
  const items: any[] = data.items ?? [];
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

  const { presignedUrl, publicUrl } = (await initRes.json()) as any;
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

async function schedulePost(
  apiKey: string,
  accountId: string,
  row: BlotatoRow,
  mediaUrl: string
): Promise<void> {
  const scheduledTime = `${row.date}T${row.time_utc}:00+00:00`;

  const target =
    row.platform === "tiktok"
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
    scheduledTime,
    post: {
      accountId,
      content: {
        text: row.caption,
        mediaUrls: [mediaUrl],
        platform: row.platform,
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
    throw new Error(`Post inplannen mislukt: ${res.status} — ${text}`);
  }

  const data = (await res.json()) as any;
  console.log(`   ✅ Ingepland op ${scheduledTime} (ID: ${data.postSubmissionId ?? data.id ?? "?"})`);
}

function getArg(flag: string): string | undefined {
  const args = process.argv.slice(2);
  const index = args.indexOf(flag);
  if (index !== -1 && args[index + 1]) return args[index + 1];
  return undefined;
}

async function main() {
  console.error(
    "⏸️  HARD OFF (2026-07-30): geen Blotato-scheduling voor ShelfieEase. Post native in de app."
  );
  process.exit(1);

  const apiKey = process.env.BLOTATO_API_KEY;
  if (!apiKey) {
    console.error("❌ BLOTATO_API_KEY ontbreekt in .env\n   Haal je key op via: my.blotato.com → Settings → API");
    process.exit(1);
  }

  const csvArg = getArg("--csv");
  if (!csvArg) {
    console.error("❌ Gebruik: npm run post:blotato -- --csv content/jun2026-blotato.csv");
    process.exit(1);
  }

  const csvPath = path.resolve(process.cwd(), csvArg);
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV niet gevonden: ${csvPath}`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(csvPath, "utf-8"));
  const pending = rows.filter((r) => r.status === "pending");

  if (pending.length === 0) {
    console.log("ℹ️  Geen pending posts gevonden in de CSV.");
    return;
  }

  console.log(`\n📅 Blotato inplannen — ${pending.length} posts uit ${path.basename(csvPath)}\n`);
  console.log("🔍 Account IDs ophalen...");

  const platforms = [...new Set(pending.map((r) => r.platform))];
  const accountIds = new Map<string, string>();
  for (const platform of platforms) {
    accountIds.set(platform, await getAccountId(apiKey, platform));
  }

  const uploadCache = new Map<string, string>();
  let scheduled = 0;
  let failed = 0;

  for (const row of pending) {
    console.log(`\n→ Post ${row.id} | ${row.platform.toUpperCase()} | ${row.date} ${row.time_utc} UTC`);
    console.log(`  Caption: ${row.caption.slice(0, 80)}...`);

    try {
      let mediaUrl: string;
      const cacheKey = row.video_filename;

      if (uploadCache.has(cacheKey)) {
        mediaUrl = uploadCache.get(cacheKey)!;
        console.log(`   ♻️  Hergebruik upload: ${mediaUrl}`);
      } else {
        const videoPath = path.join(VIDEOS_DIR, row.video_filename);
        if (!fs.existsSync(videoPath)) {
          console.warn(`   ⚠️  Video niet gevonden: ${videoPath}`);
          failed++;
          continue;
        }
        mediaUrl = await uploadMedia(apiKey, videoPath);
        uploadCache.set(cacheKey, mediaUrl);
      }

      await schedulePost(apiKey, accountIds.get(row.platform)!, row, mediaUrl);
      rows[rows.indexOf(row)].status = "scheduled";
      scheduled++;
    } catch (err: any) {
      console.error(`   ❌ Fout: ${err.message}`);
      failed++;
    }
  }

  writeCsv(rows, csvPath);
  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Ingepland: ${scheduled}   ❌ Mislukt: ${failed}`);
  console.log(`📄 CSV bijgewerkt: ${path.basename(csvPath)}`);
  console.log(`🔗 Kalender: https://my.blotato.com/calendar`);
}

main().catch((err) => {
  console.error("❌ Onverwachte fout:", err);
  process.exit(1);
});
