import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Admin password from environment variable
// Set ADMIN_PASSWORD in your .env.local or Vercel environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme123";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { valid: false, error: "Password is required" },
        { status: 400 }
      );
    }

    // Check password
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json(
      { valid: false, error: "Check failed" },
      { status: 500 }
    );
  }
}
