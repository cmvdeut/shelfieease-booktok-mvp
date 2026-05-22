import { NextRequest, NextResponse } from "next/server";
import { verifySocialHubPassword, SOCIAL_AUTH_COOKIE } from "@/lib/social/auth";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { password?: string };
  if (!verifySocialHubPassword(body.password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SOCIAL_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
