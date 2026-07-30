import { NextRequest, NextResponse } from "next/server";

/** Only allow simple CB resource filenames (no path traversal). */
function isSafeCbFilename(file: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{2,120}\.jpe?g$/i.test(file);
}

/**
 * Proxy Centraal Boekhuis / EasyCB cover JPGs.
 * Hotlinking is blocked in browsers; server-side fetch with contact header works.
 */
export async function GET(request: NextRequest) {
  const file = (request.nextUrl.searchParams.get("file") || "").trim();
  if (!isSafeCbFilename(file)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const upstream = `https://easycbapi.nl/resources/jpg/${encodeURIComponent(file)}`;
    const res = await fetch(upstream, {
      headers: {
        contact: "support@shelfieease.app",
        "User-Agent": "ShelfieEase/1.0 (cover proxy)",
        Accept: "image/jpeg,image/*",
      },
      cache: "force-cache",
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new NextResponse(null, { status: res.status === 404 ? 404 : 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
