# Social Hub (lokale/handmatige fallback)

> **Autopublish HARD OFF sinds 2026-07-30.**  
> `.github/workflows/publish-scheduled.yml` heeft `if: false` — de cron runt niet.  
> `scripts/publish-scheduled-blotato.ts` stopt meteen (`AUTOPUBLISH_HARD_OFF`).  
> Reden: @shelfieease soft-suppression (~0 bereik). Post **native** in TikTok/IG-app.  
> SeniorEase-Blotato-accounts worden hier niet geraakt.

Deze Social Hub (lokale DB + `lib/social/publishers/*`) blijft beschikbaar als **handmatige**
optie — niet als autopublish.

## Eerste setup

1. Kopieer `.env.example` → `.env.local` en vul in:
   - `DATABASE_URL="file:./prisma/social.db"`
   - `TIKTOK_ACCESS_TOKEN`, `TIKTOK_OPEN_ID` (scopes: `video.upload`, `video.publish`)
   - `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`
   - `SOCIAL_MEDIA_BASE_URL=https://www.shelfieease.app` (publieke video-URL’s voor IG)
   - Optioneel: `SOCIAL_HUB_PASSWORD` (leeg = geen login op localhost)

2. Database + seed:

```bash
npm install
npm run social:setup
```

3. Start UI + worker (twee terminals):

```bash
npm run dev
npm run social:worker
```

Open http://localhost:3000/social

## Componenten

| Onderdeel | Pad | Doel |
|-----------|-----|------|
| UI | `app/social`, `components/social/SocialHubClient.tsx` | Kalender (drag-drop), queue, media, slots |
| API | `app/api/social/*` | CRUD posts/slots, publish, worker trigger |
| Publishers | `lib/social/publishers/tiktok.ts`, `instagram.ts` | Platform API’s |
| Worker | `scripts/social-worker.ts` | Elke 60s due posts (`npm run social:worker`) |
| CLI publish | `scripts/social-publish.ts` | `npm run social:publish -- --id=<id>` |
| DB | `prisma/schema.prisma` | Post, ScheduleSlot, PublishLog |

## Workflow

1. **Seed** importeert `scheduled-posts.json` (eenmalig als DB leeg is).
2. Posts met `manualOnly` (carousel/story/geen video) krijgen status `skipped` — alleen handmatig in de app.
3. Reels met video: status `scheduled` → worker of knop **Publish now** in UI.
4. Instagram vereist bereikbare URL: `https://www.shelfieease.app/videos/...` (deploy moet live staan).

## Windows Taakplanner (optioneel)

Elke minuut in projectmap:

```
npm run social:worker:once
```

## Huidige primaire pad (sinds juli 2026)

- `.github/workflows/publish-scheduled.yml` — actief, cron `*/15 * * * *`
- `scripts/publish-scheduled-blotato.ts` — leest `scheduled-posts.json`, publiceert via Blotato API
- Resultaten worden teruggeschreven naar `scheduled-posts.json` (`status`, `blotatoPostId`) en `social-posts-log.md`

Deze pagina beschrijft de **lokale fallback** (Social Hub + worker) — alleen nog nodig als Blotato niet bereikbaar is. Zie ook `docs/MANUAL-SOCIAL-POSTING.md`.

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| IG container timeout | Worker lokaal houden; video HEAD-check faalt → deploy `public/videos` |
| TikTok geen caption | Alleen Direct Post (`video.publish`), geen inbox |
| Token expired | Vernieuw token in Meta/TikTok developer portal, update `.env.local` |
| 401 in UI | Login met `SOCIAL_HUB_PASSWORD` of cookie via `/api/social/auth` |
