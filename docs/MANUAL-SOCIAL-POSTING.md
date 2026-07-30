# Social media — handmatig (primair sinds 2026-07-30)

> **Autopublish HARD OFF.** Geen GitHub Actions → Blotato voor ShelfieEase.  
> Workflow `publish-scheduled.yml` = `if: false`. Script = early return.  
> Post native in de TikTok/Instagram-app tot bereik herstelt.

## Aanbevolen: native in de app

1. Film/upload op telefoon (echte B-roll, geen pure Remotion als hoofdcontent).
2. Caption uit `brand-brief.md` / Story Vault.
3. Optioneel noteren in `social-posts-log.md`.

## Social Hub (optioneel, lokaal)

Zie **[docs/SOCIAL-HUB.md](./SOCIAL-HUB.md)** voor setup (`npm run social:setup`, `npm run dev`, `npm run social:worker`).

- UI: http://localhost:3000/social
- Gebruik alleen handmatig — niet als vervanging van native posting tijdens recovery

## Technisch (uitgeschakeld)

- Workflow `.github/workflows/publish-scheduled.yml`: **uit** (`if: false`)
- `scripts/publish-scheduled-blotato.ts`: `AUTOPUBLISH_HARD_OFF = true` + TikTok/IG in `DISABLED_PLATFORMS`
- Blotato-queue voor @shelfieease (44442 / 50003): leeg gecontroleerd 2026-07-30
- SeniorEase-scheduling in Blotato blijft los van deze repo
