/**
 * One-off: schedule the second MBR TikTok batch (uitleen / sprayed-edges /
 * reading-slump) to @shelfieease (Blotato account 44442) at 16:00 Europe/Amsterdam.
 * Uploads media directly to Blotato (no public URL dependency).
 */
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: ".env.local" });

const BLOTATO_API = "https://backend.blotato.com/v2";
const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");
const TIKTOK_ACCOUNT_ID = "44442"; // @shelfieease, confirmed via /users/me/accounts

interface Post {
  id: string;
  date: string; // YYYY-MM-DD
  video_filename: string;
  caption: string;
}

const posts: Post[] = [
  {
    id: "MBR4",
    date: "2026-07-24",
    video_filename: "mbr-nl-uitleen.mp4",
    caption: `Aan wie heb je dit ook alweer uitgeleend? 👀

Ik was het zelf drie keer vergeten.
ShelfieEase onthoudt het voor je: wie, wanneer, welk boek.
Geen speurtocht in je DM's meer.

shelfieease.app, gratis, geen account

Comment wie nog steeds jouw boek heeft 💀

#BookTok #TBR #Boeken #ShelfieEase #Bookstagram`,
  },
  {
    id: "MBR5",
    date: "2026-07-25",
    video_filename: "mbr-nl-sprayed-edges.mp4",
    caption: `Heb ik de sprayed edges of de standaard editie? 😭

Special editions zien er thuis allemaal hetzelfde uit.
Scan de ISBN vóór je afrekent, zie het meteen.
Geen dubbele special edition meer.

shelfieease.app

Comment je duurste dubbele aankoop 💸

#BookTok #SpecialEdition #Boeken #ShelfieEase #BookHaul`,
  },
  {
    id: "MBR6",
    date: "2026-07-26",
    video_filename: "mbr-nl-reading-slump.mp4",
    caption: `In een reading slump? Blader door je eigen shelf ✨

Je hebt vast een boek dat je vergeten bent.
Geen nieuwe aankoop nodig, gewoon je TBR shelf openen.
Vanavond weer beginnen.

shelfieease.app

Comment het boek dat je nu weer oppakt 📖

#BookTok #ReadingSlump #TBR #ShelfieEase #Boeken`,
  },
];

async function uploadMedia(apiKey: string, videoPath: string): Promise<string> {
  const fileName = path.basename(videoPath);
  const fileSize = fs.statSync(videoPath).size;
  console.log(`   📤 Uploaden: ${fileName} (${(fileSize / 1024 / 1024).toFixed(1)} MB)...`);

  const initRes = await fetch(`${BLOTATO_API}/media/uploads`, {
    method: "POST",
    headers: { "blotato-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: fileName, contentType: "video/mp4" }),
  });
  if (!initRes.ok) throw new Error(`Upload init mislukt: ${initRes.status} — ${await initRes.text()}`);

  const { presignedUrl, publicUrl } = (await initRes.json()) as { presignedUrl: string; publicUrl: string };
  const videoBuffer = fs.readFileSync(videoPath);
  const putRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(fileSize) },
    body: videoBuffer,
  });
  if (!putRes.ok) throw new Error(`Video PUT mislukt: ${putRes.status} — ${await putRes.text()}`);

  console.log(`   ✅ Geüpload → ${publicUrl}`);
  return publicUrl;
}

async function schedulePost(apiKey: string, post: Post, mediaUrl: string): Promise<string> {
  // 16:00 Europe/Amsterdam in July = CEST = UTC+2 -> 14:00 UTC
  const scheduledTime = `${post.date}T14:00:00+00:00`;

  const body = {
    scheduledTime,
    post: {
      accountId: TIKTOK_ACCOUNT_ID,
      content: {
        text: post.caption,
        mediaUrls: [mediaUrl],
        platform: "tiktok",
      },
      target: {
        targetType: "tiktok",
        privacyLevel: "PUBLIC_TO_EVERYONE",
        isAiGenerated: false,
        disabledComments: false,
        disabledDuet: false,
        disabledStitch: false,
        isBrandedContent: false,
        isYourBrand: false,
      },
    },
  };

  const res = await fetch(`${BLOTATO_API}/posts`, {
    method: "POST",
    headers: { "blotato-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Post inplannen mislukt: ${res.status} — ${await res.text()}`);

  const data = (await res.json()) as { postSubmissionId?: string; id?: string };
  const submissionId = data.postSubmissionId ?? data.id ?? "?";
  console.log(`   ✅ Ingepland ${post.date} 16:00 NL (ID: ${submissionId})`);
  return submissionId;
}

/** When true, refuse to schedule. Typed as boolean so TS does not treat the rest as unreachable. */
const AUTOPUBLISH_HARD_OFF: boolean = true;

async function main() {
  if (AUTOPUBLISH_HARD_OFF) {
    console.error(
      "⏸️  HARD OFF (2026-07-30): geen Blotato-scheduling voor ShelfieEase. Post native in de app."
    );
    process.exitCode = 1;
    return;
  }

  const apiKey = process.env.BLOTATO_API_KEY;
  if (!apiKey) {
    console.error("❌ BLOTATO_API_KEY ontbreekt in .env.local");
    process.exit(1);
  }

  console.log(`\n📅 MBR batch 2 inplannen — ${posts.length} TikTok posts naar account ${TIKTOK_ACCOUNT_ID}\n`);

  const results: { id: string; date: string; video_filename: string; submissionId: string }[] = [];

  for (const post of posts) {
    console.log(`\n→ ${post.id} | ${post.date} 16:00 NL | ${post.video_filename}`);
    const videoPath = path.join(VIDEOS_DIR, post.video_filename);
    if (!fs.existsSync(videoPath)) {
      console.error(`   ❌ Video niet gevonden: ${videoPath}`);
      continue;
    }
    const mediaUrl = await uploadMedia(apiKey, videoPath);
    const submissionId = await schedulePost(apiKey, post, mediaUrl);
    results.push({ id: post.id, date: post.date, video_filename: post.video_filename, submissionId });
  }

  console.log("\n" + "─".repeat(50));
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("❌ Onverwachte fout:", err.message);
  process.exit(1);
});
