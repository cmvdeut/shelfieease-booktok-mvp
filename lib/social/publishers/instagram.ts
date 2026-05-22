import type { PublishInput, PublishResult } from "../types";
import {
  assertInstagramConfigured,
  getInstagramConfig,
} from "../config";
import {
  assertMediaFileExists,
  getPublicMediaUrl,
  verifyPublicUrl,
} from "../media";

const POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 20_000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function publishToInstagram(input: PublishInput): Promise<PublishResult> {
  assertInstagramConfigured();
  assertMediaFileExists(input.mediaPath);

  const { accessToken, userId, graphVersion } = getInstagramConfig();
  const videoUrl = getPublicMediaUrl(input.mediaPath);
  await verifyPublicUrl(videoUrl);

  const base = `https://graph.facebook.com/${graphVersion}/${userId}`;

  const containerParams = new URLSearchParams({
    video_url: videoUrl,
    caption: input.caption,
    media_type: "REELS",
    access_token: accessToken,
  });

  const containerRes = await fetch(`${base}/media`, {
    method: "POST",
    body: containerParams,
  });

  const containerData = (await containerRes.json()) as {
    id?: string;
    error?: { message?: string; error_user_msg?: string };
  };

  if (!containerRes.ok || !containerData.id) {
    return {
      success: false,
      message: `Instagram container failed: ${JSON.stringify(containerData)}`,
      raw: containerData,
    };
  }

  const containerId = containerData.id;
  let status = "IN_PROGRESS";

  for (let i = 0; i < POLL_ATTEMPTS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const statusRes = await fetch(
      `${base}/media?fields=status_code&access_token=${encodeURIComponent(accessToken)}&ids=${containerId}`
    );
    const statusJson = (await statusRes.json()) as Record<
      string,
      { status_code?: string }
    >;
    status = statusJson[containerId]?.status_code || "UNKNOWN";
    if (status === "FINISHED") break;
    if (status === "ERROR" || status === "EXPIRED") {
      return {
        success: false,
        message: `Instagram container processing failed: ${status}`,
        raw: statusJson,
      };
    }
  }

  if (status !== "FINISHED") {
    return {
      success: false,
      message: `Instagram container not ready after polling: ${status}`,
    };
  }

  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  });

  const publishRes = await fetch(`${base}/media_publish`, {
    method: "POST",
    body: publishParams,
  });

  const publishData = (await publishRes.json()) as {
    id?: string;
    error?: { message?: string };
  };

  if (!publishRes.ok || !publishData.id) {
    return {
      success: false,
      message: `Instagram publish failed: ${JSON.stringify(publishData)}`,
      raw: publishData,
    };
  }

  let permalink = "";
  try {
    await sleep(5000);
    const linkRes = await fetch(
      `${base}/media?fields=id,permalink&limit=1&access_token=${encodeURIComponent(accessToken)}`
    );
    const linkJson = (await linkRes.json()) as {
      data?: { permalink?: string }[];
    };
    permalink = linkJson.data?.[0]?.permalink || "";
  } catch {
    permalink = "";
  }

  return {
    success: true,
    publishId: publishData.id,
    permalink,
    message: permalink
      ? `Instagram Reel published: ${permalink}`
      : `Instagram Reel published (media id ${publishData.id})`,
    raw: publishData,
  };
}
