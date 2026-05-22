# TikTok-post automatiseren

> **Status (mei 2026):** Automatisch posten via GitHub Actions is **uitgeschakeld**. Gebruik `scheduled-posts.json` alleen als planningskalender en post handmatig in de TikTok-app. Zie [MANUAL-SOCIAL-POSTING.md](./MANUAL-SOCIAL-POSTING.md).

---

Historische notitie: je had een **queue** (`scheduled-posts.json`) en een **GitHub Action** die elke 15 minuten keek of er een post gepland stond. Onderstaand beschrijft die setup (niet meer actief).

---

## Huidige situatie

- **Wat er al werkt:** De workflow leest `scheduled-posts.json` en uploadt het filmpje (pad uit `video_file`, bv. `public/videos/post-guilt.mp4`) naar TikTok via de **Inbox API**. Je krijgt een melding in de TikTok-app en tikt daar op Publish. De videobestanden moeten in de repo staan (niet in .gitignore).
- **Wat niet kan met Inbox:** De TikTok **Inbox API** ondersteunt **geen caption** in de request. Daarom moet je de caption handmatig in de app plakken.

---

## Optie 1: Direct Post (caption automatisch mee)

TikTok heeft naast Inbox ook **Direct Post**: video + caption gaan in één keer live (of naar privé als je app nog niet geaudit is).

- **Voordelen:** Caption staat al goed; je hoeft in de app alleen nog te controleren (of niets als je direct publiceert).
- **Wat je nodig hebt:**
  - In je TikTok Developer app de scope **`video.publish`** (naast of in plaats van `video.upload`).
  - Opnieuw inloggen/authorizen zodat je access token `video.publish` heeft.
  - In GitHub Secrets zetten: `TIKTOK_USE_DIRECT_POST=true` en `TIKTOK_PRIVACY_LEVEL=PUBLIC_TO_EVERYONE` (of een andere waarde die je app teruggeeft).

De workflow in deze repo ondersteunt Direct Post: als `TIKTOK_USE_DIRECT_POST` is gezet, wordt de caption uit de queue meegegeven en wordt het Direct Post endpoint gebruikt.

**Let op:** Zonder app-audit post TikTok alleen als **privé**. Na goedkeuring door TikTok kun je publiek posten.

---

## Optie 2: n8n

Je kunt hetzelfde doen in **n8n**:

1. **Trigger:** Schedule (cron) of webhook wanneer je een post toevoegt.
2. **Lezen:** Lees `scheduled-posts.json` (of een Google Sheet / Airtable) en filter op “nu posten”.
3. **TikTok:** Gebruik de **HTTP Request** node:
   - OAuth2 met TikTok (Client Key + Secret, refresh token).
   - `POST https://open.tiktokapis.com/v2/post/publish/video/init/` (Direct Post) met body: `post_info` (o.a. `title` = caption) + `source_info` (FILE_UPLOAD of PULL_FROM_URL).
4. Bij FILE_UPLOAD: daarna de video uploaden naar de `upload_url` (PUT) zoals in de GitHub Action.

Er is geen officiële “TikTok Post” node in n8n; je bouwt het met HTTP Request + OAuth2. Services zoals **Blotato** (community node) kunnen de complexiteit verbergen als je liever een kant-en-klare integratie gebruikt.

---

## Optie 3: MCP (Cursor / AI-assistent)

Er staat een **MCP-server** in de repo: `mcp-tiktok/`.

- **Tool:** `post_next_tiktok` — leest `scheduled-posts.json`, zoekt de eerste TikTok-post die “due” is, uploadt video (en bij Direct Post de caption) via de TikTok API.
- **Credentials:** Zet in env (of in Cursor MCP-config): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REFRESH_TOKEN` (of `TIKTOK_ACCESS_TOKEN`). Optioneel: `TIKTOK_USE_DIRECT_POST`, `TIKTOK_PRIVACY_LEVEL`, `REPO_ROOT`.

**Stappen:**

1. In de repo: `cd mcp-tiktok && npm install && npm run build`
2. In Cursor: MCP-configuratie toevoegen (zie `mcp-tiktok/README.md`) met de juiste `command`, `args` en `env`.
3. In de chat: “Post de volgende TikTok” of de tool `post_next_tiktok` aanroepen.

Zie **`mcp-tiktok/README.md`** voor installatie, env-variabelen en Cursor MCP-voorbeelden.

---

## Samenvatting

| Methode            | Video automatisch | Caption automatisch | Extra vereisten                          |
|--------------------|-------------------|----------------------|------------------------------------------|
| Huidige workflow   | Ja (Inbox)        | Nee                  | -                                        |
| Direct Post (repo) | Ja                | Ja                   | `video.publish`, secrets (zie boven)    |
| n8n                | Ja                | Ja (bij Direct Post) | n8n-instance, TikTok OAuth in n8n        |
| MCP                | Ja                | Ja (bij Direct Post) | Eigen MCP-server + credentials           |

**Praktische eerste stap:** Zet Direct Post aan in de bestaande workflow (secrets + scope `video.publish`), dan hoef je de caption niet meer handmatig te plakken. Als je daarna n8n of MCP wilt gebruiken, is dezelfde API-flow toepasbaar.
