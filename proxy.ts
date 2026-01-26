import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Redirect non-www to www (canonical URL is https://www.shelfieease.app)
  if (hostname === "shelfieease.app" || hostname.startsWith("shelfieease.app:")) {
    url.host = "www.shelfieease.app";
    return NextResponse.redirect(url, 301);
  }

  // Redirect old domains to new domain
  if (
    hostname.includes("seniorease") ||
    hostname.includes("vercel.app")
  ) {
    url.host = "www.shelfieease.app";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
