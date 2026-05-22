# Social Hub (Blotato-achtig)

Lokale publishing hub voor **TikTok** (Direct Post) en **Instagram Reels** (Graph API). UI op `/social`, worker op je pc.

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

## Oude paden (niet meer gebruiken voor auto-publish)

- `.github/workflows/publish-scheduled.yml` — uit (`if: false`)
- GitHub Actions cron voor IG/TikTok — vervangen door lokale worker

Zie ook `docs/MANUAL-SOCIAL-POSTING.md` voor handmatige fallback.

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| IG container timeout | Worker lokaal houden; video HEAD-check faalt → deploy `public/videos` |
| TikTok geen caption | Alleen Direct Post (`video.publish`), geen inbox |
| Token expired | Vernieuw token in Meta/TikTok developer portal, update `.env.local` |
| 401 in UI | Login met `SOCIAL_HUB_PASSWORD` of cookie via `/api/social/auth` |
