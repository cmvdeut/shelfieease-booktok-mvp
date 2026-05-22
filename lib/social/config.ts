export function getRepoRoot(): string {
  return process.env.REPO_ROOT || process.cwd();
}

export function getMediaBaseUrl(): string {
  return (process.env.SOCIAL_MEDIA_BASE_URL || "https://www.shelfieease.app").replace(
    /\/$/,
    ""
  );
}

export function getInstagramConfig() {
  return {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || "",
    userId: process.env.INSTAGRAM_USER_ID || "",
    graphVersion: process.env.INSTAGRAM_GRAPH_VERSION || "v21.0",
  };
}

export function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY || "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
    refreshToken: process.env.TIKTOK_REFRESH_TOKEN || "",
    accessToken: process.env.TIKTOK_ACCESS_TOKEN || "",
    useDirectPost: process.env.TIKTOK_USE_DIRECT_POST !== "false",
    privacyLevel: process.env.TIKTOK_PRIVACY_LEVEL || "PUBLIC_TO_EVERYONE",
  };
}

export function assertTikTokConfigured(): void {
  const { clientKey, clientSecret, refreshToken, accessToken } = getTikTokConfig();
  if (!clientKey || !clientSecret) {
    throw new Error("TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET are required");
  }
  if (!refreshToken && !accessToken) {
    throw new Error("TIKTOK_REFRESH_TOKEN or TIKTOK_ACCESS_TOKEN is required");
  }
}

export function assertInstagramConfigured(): void {
  const { accessToken, userId } = getInstagramConfig();
  if (!accessToken || !userId) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID are required");
  }
}
