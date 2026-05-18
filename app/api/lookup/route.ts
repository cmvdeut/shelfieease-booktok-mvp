import { NextRequest, NextResponse } from "next/server";
import { lookupByIsbn } from "@/lib/lookup";

const NO_STORE = "no-store, no-cache, must-revalidate";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("isbn") || "";
  const isbn = raw.replace(/[^0-9X]/gi, "").trim();

  if (!isbn || isbn.length < 10) {
    return NextResponse.json(
      { error: "Invalid ISBN" },
      { status: 400, headers: { "Cache-Control": NO_STORE } }
    );
  }

  try {
    const result = await lookupByIsbn(isbn);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json(
      { error: "Lookup failed" },
      { status: 502, headers: { "Cache-Control": NO_STORE } }
    );
  }
}
