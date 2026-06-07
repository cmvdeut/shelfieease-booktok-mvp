#!/usr/bin/env node
/**
 * TikTok OAuth helper — haalt een nieuw access + refresh token op.
 *
 * Stap 1: Voer dit script uit zonder argumenten → krijg de OAuth URL
 *   node scripts/tiktok-auth.js
 *
 * Stap 2: Open de URL in een INCOGNITO venster, autoriseer
 *         TikTok stuurt je naar https://www.shelfieease.app/tiktok?code=XXXX
 *         Kopieer de code-waarde uit de URL
 *
 * Stap 3: Voer het script uit met de code:
 *   node scripts/tiktok-auth.js JOUW_CODE
 *
 * Vereist in .env.local:
 *   TIKTOK_CLIENT_KEY=aw1d6a4eopk8a3cg
 *   TIKTOK_CLIENT_SECRET=<uit TikTok Developer Portal>
 */

"use strict";

const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const envLocal = loadEnvLocal();
function env(key) {
  return process.env[key] || envLocal[key] || "";
}

const CLIENT_KEY = env("TIKTOK_CLIENT_KEY");
const CLIENT_SECRET = env("TIKTOK_CLIENT_SECRET");
// Must match Login Kit → Web redirect URI in developers.tiktok.com exactly
const REDIRECT_URI =
  env("TIKTOK_REDIRECT_URI") || "https://www.shelfieease.app";
const SCOPES = env("TIKTOK_SCOPES") || "video.upload,video.publish,video.list";

const code = process.argv[2];

if (!CLIENT_KEY) {
  console.error(`
❌  TIKTOK_CLIENT_KEY ontbreekt in .env.local

Ga naar https://developers.tiktok.com/apps/ → jouw app → App info
Kopieer Client key en secret naar .env.local
`);
  process.exit(1);
}

if (!code) {
  const state = Math.random().toString(36).slice(2);
  const url =
    `https://www.tiktok.com/v2/auth/authorize/` +
    `?client_key=${encodeURIComponent(CLIENT_KEY)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${encodeURIComponent(state)}`;

  console.log("\n🔐  TikTok OAuth — Stap 1 van 2\n");
  console.log("Open deze URL in een INCOGNITO venster:\n");
  console.log("  " + url);
  console.log(
    `\nNa autorisatie word je doorgestuurd naar:\n  ${REDIRECT_URI}?code=XXXX`
  );
  console.log(
    `\nRedirect URI in portal moet exact zijn:\n  ${REDIRECT_URI}`
  );
  console.log(
    "\nKopieer de code-waarde uit de URL en voer stap 2 uit:\n"
  );
  console.log("  node scripts/tiktok-auth.js JOUW_CODE\n");
  process.exit(0);
}

if (!CLIENT_SECRET) {
  console.error(`
❌  TIKTOK_CLIENT_SECRET ontbreekt in .env.local

Ga naar https://developers.tiktok.com/apps/ → jouw app → App info
Kopieer de Client secret en voeg toe aan .env.local:

  TIKTOK_CLIENT_KEY=<jouw_client_key>
  TIKTOK_CLIENT_SECRET=<jouw_secret>
  TIKTOK_REDIRECT_URI=https://www.shelfieease.app
`);
  process.exit(1);
}

console.log("\n⏳  Code inwisselen voor tokens...\n");

const body = new URLSearchParams({
  client_key: CLIENT_KEY,
  client_secret: CLIENT_SECRET,
  code,
  grant_type: "authorization_code",
  redirect_uri: REDIRECT_URI,
});

fetch("https://open.tiktokapis.com/v2/oauth/token/", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: body.toString(),
})
  .then((r) => r.json())
  .then((data) => {
    if (data.error) {
      console.error("❌  Fout van TikTok API:", data.error, data.error_description || "");
      process.exit(1);
    }

    const { access_token, refresh_token, expires_in, refresh_expires_in } = data;

    console.log("✅  Tokens ontvangen!\n");
    console.log("─".repeat(60));
    console.log("\n📋  Kopieer deze regels naar .env.local:\n");
    console.log(`TIKTOK_ACCESS_TOKEN=${access_token}`);
    console.log(`TIKTOK_REFRESH_TOKEN=${refresh_token}`);
    console.log("\n" + "─".repeat(60));
    console.log(`\nAccess token geldig : ${Math.round(expires_in / 3600)} uur`);
    console.log(`Refresh token geldig: ${Math.round(refresh_expires_in / 86400)} dagen\n`);
    console.log("Voeg ook toe aan GitHub Secrets (Settings → Secrets → Actions):");
    console.log("  TIKTOK_ACCESS_TOKEN en TIKTOK_REFRESH_TOKEN\n");
  })
  .catch((err) => {
    console.error("❌  Netwerkfout:", err.message);
    process.exit(1);
  });
