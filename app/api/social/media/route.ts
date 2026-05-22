import { NextRequest, NextResponse } from "next/server";
import { listVideoFiles, getPublicMediaUrl } from "@/lib/social/media";
import { checkSocialAuth, unauthorized } from "@/lib/social/api-helpers";

export async function GET(req: NextRequest) {
  if (!checkSocialAuth(req)) return unauthorized();
  const files = listVideoFiles().map((f) => ({
    ...f,
    publicUrl: getPublicMediaUrl(f.path),
  }));
  return NextResponse.json(files);
}
