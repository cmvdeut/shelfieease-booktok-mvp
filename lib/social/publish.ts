import type { Platform, PublishInput, PublishResult } from "./types";
import { publishToTikTok } from "./publishers/tiktok";
import { publishToInstagram } from "./publishers/instagram";

export async function publishPost(input: PublishInput): Promise<PublishResult> {
  if (input.platform === "tiktok") {
    return publishToTikTok(input);
  }
  if (input.platform === "instagram") {
    return publishToInstagram(input);
  }
  return { success: false, message: `Unsupported platform: ${input.platform}` };
}

export function canAutoPublish(platform: Platform, format: string, manualOnly: boolean): boolean {
  if (manualOnly) return false;
  if (format !== "reel") return false;
  if (!platform || (platform !== "tiktok" && platform !== "instagram")) return false;
  return true;
}
