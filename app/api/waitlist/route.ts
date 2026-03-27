import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!redis) {
    // Graceful degradation: log and accept without storing
    console.warn("Waitlist: Redis not configured, email not stored:", email);
    return NextResponse.json({ ok: true });
  }

  await redis.sadd("waitlist:emails", email);
  await redis.hset(`waitlist:meta:${email}`, {
    addedAt: new Date().toISOString(),
    source: "upgrade-wall",
  });

  return NextResponse.json({ ok: true });
}
