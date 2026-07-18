import { NextRequest, NextResponse } from "next/server";
import { addContactToBrevo } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body?.source === "string" ? body.source : "homepage-footer";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await addContactToBrevo(email, source);

  return NextResponse.json({ ok: true });
}
