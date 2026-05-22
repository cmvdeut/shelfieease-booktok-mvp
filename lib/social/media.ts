import fs from "fs";
import path from "path";
import { getMediaBaseUrl, getRepoRoot } from "./config";

/** Turn repo path into public HTTPS URL for Instagram Graph API */
export function getPublicMediaUrl(mediaPath: string): string {
  const normalized = mediaPath.replace(/\\/g, "/").replace(/^public\//, "");
  return `${getMediaBaseUrl()}/${normalized}`;
}

export function resolveMediaPath(mediaPath: string): string {
  if (path.isAbsolute(mediaPath)) return mediaPath;
  return path.join(getRepoRoot(), mediaPath);
}

export function assertMediaFileExists(mediaPath: string): string {
  const full = resolveMediaPath(mediaPath);
  if (!fs.existsSync(full)) {
    throw new Error(`Media file not found: ${full}`);
  }
  return full;
}

export async function verifyPublicUrl(url: string): Promise<void> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) {
      throw new Error(`Media URL not reachable (${res.status}): ${url}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Media URL check failed: ${msg}`);
  }
}

export function listVideoFiles(): { path: string; name: string; size: number }[] {
  const dir = path.join(getRepoRoot(), "public", "videos");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      return {
        path: `public/videos/${f}`,
        name: f,
        size: stat.size,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
