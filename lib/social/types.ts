export type Platform = "tiktok" | "instagram";

export type PostFormat = "reel" | "carousel" | "story";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "skipped";

export type PublishInput = {
  platform: Platform;
  caption: string;
  /** Repo-relative path, e.g. public/videos/foo.mp4 */
  mediaPath: string;
  /** TikTok: default true in hub */
  useDirectPost?: boolean;
};

export type PublishResult = {
  success: boolean;
  permalink?: string;
  publishId?: string;
  message: string;
  raw?: unknown;
};
