import { NextRequest } from "next/server";
import { getSocialHubPassword, verifySocialHubPassword, SOCIAL_AUTH_COOKIE } from "./auth";

export function checkSocialAuth(req: NextRequest): boolean {
  if (!getSocialHubPassword()) return true;
  const password = getSocialHubPasswordFromRequest(req);
  return verifySocialHubPassword(password);
}

function getSocialHubPasswordFromRequest(req: NextRequest): string | null {
  const header = req.headers.get("x-social-password");
  if (header) return header;
  const cookie = req.cookies.get(SOCIAL_AUTH_COOKIE)?.value;
  if (cookie === "1") return process.env.SOCIAL_HUB_PASSWORD || "";
  return null;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
