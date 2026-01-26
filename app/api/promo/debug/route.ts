import { NextResponse } from "next/server";
import { isRedisAvailable } from "@/lib/promo-db";

export const runtime = "nodejs";

export async function GET() {
  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;
  const redisAvailable = isRedisAvailable();

  return NextResponse.json({
    redis: {
      hasUrl,
      hasToken,
      available: redisAvailable,
      urlPrefix: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 20) + "..." || "not set",
    },
    environment: process.env.NODE_ENV,
  });
}
