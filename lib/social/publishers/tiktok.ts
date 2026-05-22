import fs from "fs";
import type { PublishInput, PublishResult } from "../types";
import { getTikTokConfig, assertTikTokConfigured } from "../config";
import { assertMediaFileExists } from "../media";

async function getAccessToken(): Promise<string> {
  assertTikTokConfigured();
  const { clientKey, clientSecret, refreshToken, accessToken } = getTikTokConfig();

  if (refreshToken) {
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
    const data = (await res.json()) as { access_token?: string; error_description?: string };
    if (data.access_token) return data.access_token;
  }
  if (accessToken) return accessToken;
  throw new Error("Could not obtain TikTok access token");
}

export async function publishToTikTok(input: PublishInput): Promise<PublishResult> {
  const videoPath = assertMediaFileExists(input.mediaPath);
  const token = await getAccessToken();
  const cfg = getTikTokConfig();
  const directPost = input.useDirectPost ?? cfg.useDirectPost;
  const caption = input.caption.slice(0, 2200);
  const fileSize = fs.statSync(videoPath).size;

  let initUrl: string;
  let initBody: Record<string, unknown>;

  if (directPost) {
    initUrl = "https://open.tiktokapis.com/v2/post/publish/video/init/";
    initBody = {
      post_info: { title: caption, privacy_level: cfg.privacyLevel },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: fileSize,
        chunk_size: fileSize,
        total_chunk_count: 1,
      },
    };
  } else {
    initUrl = "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";
    initBody = {
      source_info: {
        source: "FILE_UPLOAD",
        video_size: fileSize,
        chunk_size: fileSize,
        total_chunk_count: 1,
      },
    };
  }

  const initRes = await fetch(initUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(initBody),
  });

  const initData = (await initRes.json()) as {
    data?: { publish_id?: string; upload_url?: string };
    error?: { code?: string; message?: string };
  };

  if (!initRes.ok || !initData.data?.upload_url) {
    return {
      success: false,
      message: `TikTok init failed: ${initRes.status} ${JSON.stringify(initData)}`,
      raw: initData,
    };
  }

  const uploadUrl = initData.data.upload_url;
  const videoBuffer = fs.readFileSync(videoPath);
  const lastByte = fileSize - 1;
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Range": `bytes 0-${lastByte}/${fileSize}`,
      "Content-Length": String(fileSize),
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return {
      success: false,
      message: `TikTok upload failed: ${uploadRes.status} ${text}`,
    };
  }

  const publishId = initData.data.publish_id;
  const message = directPost
    ? `TikTok direct post submitted. Publish ID: ${publishId}`
    : `TikTok inbox upload OK. Publish ID: ${publishId}. Add caption in TikTok app.`;

  return {
    success: true,
    publishId,
    message,
    raw: initData,
  };
}
