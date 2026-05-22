export function getSocialHubPassword(): string | null {
  const p = process.env.SOCIAL_HUB_PASSWORD;
  return p && p.length > 0 ? p : null;
}

export function verifySocialHubPassword(input: string | null | undefined): boolean {
  const expected = getSocialHubPassword();
  if (!expected) return true;
  return input === expected;
}

export const SOCIAL_AUTH_COOKIE = "social_hub_auth";
