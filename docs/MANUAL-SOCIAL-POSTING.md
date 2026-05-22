# Social media — handmatig & Social Hub

Automatisch publiceren via **GitHub Actions** is uitgeschakeld. Gebruik de **Social Hub** voor geplande Reels, of post volledig handmatig.

## Aanbevolen: Social Hub

Zie **[docs/SOCIAL-HUB.md](./SOCIAL-HUB.md)** voor setup (`npm run social:setup`, `npm run dev`, `npm run social:worker`).

- UI: http://localhost:3000/social (kalender, queue, media-bibliotheek)
- Auto-publish alleen voor **reels** met `public/videos/*.mp4` en geldige tokens
- Carrousels/stories blijven **handmatig** (`manualOnly` / status `skipped`)

## Handmatige workflow (fallback)

| Bestand | Doel |
|---------|------|
| `scheduled-posts.json` | Export/import; seed voor SQLite |
| `docs/INSTAGRAM-JUNI-2026-QUEUE.md` | Overzicht juni 2026 Instagram |
| `SOCIAL-CALENDAR.md` | Content + copy per dag |
| `social-posts-log.md` | Live gezet + URL bijhouden |

1. Open queue-doc of Social Hub voor vandaag.
2. Video: `public/videos/<bestand>.mp4` — app of Meta Business Suite.
3. Caption uit post / JSON (UTM in bio waar van toepassing).
4. Noteer in `social-posts-log.md` indien gewenst.

## TikTok

Social Hub gebruikt **Direct Post** met caption. Zonder hub: TikTok-app met video + caption uit kalender.

## Technisch

- Workflow `.github/workflows/publish-scheduled.yml`: geen cron, `if: false`
- `mcp-tiktok` blijft beschikbaar; primaire publish-laag is `lib/social/publishers/*`
