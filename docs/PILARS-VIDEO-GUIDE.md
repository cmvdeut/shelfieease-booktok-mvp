# TikTok/Pilars — welke video wanneer?

De filmpjes in `TikTok/Pilars/` zijn je **sterkste assets** (meer beweging, mood, minder “zwarte slide met tekst”). Gebruik die voor **TikTok én Instagram Reels** in plaats van alleen `public/videos/*` (Remotion NL-tekst).

## Bestanden → pijler

| Bestand | Pijler | Gebruik voor |
|---------|--------|----------------|
| `(15) Double Buy.mp4` | Pain | Dubbel kopen, boekwinkel — **sterk voor IG hook** |
| `(43)scattered reading.mp4` | Pain | Chaos / vergeten waar je was |
| `(107) Cluster stress.mp4` | Pain | TBR-stress (al op TikTok gepland) |
| `(114) Calm Relief.mp4` | Transformation | Voor/na rust, oplossing |
| `(49) visula light.mp4` | Features | Visueel / aesthetic shelves |
| `(64) Sharing.mp4` | Features | Shelfie card delen |
| `(19) one system.mp4` | Features | Eén systeem voor al je boeken |
| `(21) Identity.mp4` | Identity | Book collector identity |
| `Video 1 - Identity.mp4` | Identity | Langere identity-variant |
| `(145) Myths.mp4` | Myths | “Je hebt te veel boeken” etc. |
| `(156) stop over-organizing.mp4` | Myths | Anti-perfectionisme |
| `post 3.mp4` / `post 4.mp4` | Short | Korte clips, story of test |

Zie `TikTok/Pilars/PILLARS.md` voor tone per pijler.

## Publiceren

### TikTok (app of Zernio)

- Upload **direct** het bestand uit `TikTok/Pilars/…`
- Geen copy naar `public/videos` nodig

### Instagram Reels (Zernio / Graph API)

Instagram heeft een **publieke video-URL** nodig als je via API plant:

1. **Optie A:** Kopieer MP4 naar `public/videos/` en deploy naar shelfieease.app  
   - bv. `public/videos/pilar-double-buy.mp4`  
   - URL: `https://www.shelfieease.app/videos/pilar-double-buy.mp4`
2. **Optie B:** Upload de Pilars-MP4 **handmatig** in de Instagram-app (geen URL nodig)
3. **Optie C:** Zernio upload vanaf lokaal pad (als je via Claude/zernio-publish werkt)

### Zelfde video op beide platforms

- **Geen** TikTok-watermark op het bestand dat naar IG gaat
- IG: hook in **beeld** (eerste 2 sec), niet alleen tekst-slide
- Caption: NL uit `INSTAGRAM-JUNI-2026-QUEUE.md` of `2-week-plan-feb2-15.md` (Engels plan → vertaal kort)

## Snelle caption-starters (EN → pas aan NL)

**Double Buy:**  
`POV: je staat bij de kassa en je MOET weten of je dit boek al hebt 📚 → link in bio`

**Cluster stress:**  
`when your TBR pile gives you stress 😭📚 → ShelfieEase · link in bio`

**Sharing:**  
`share your shelf as a Shelfie card 📚✨ · gratis in bio`

**Calm Relief:**  
`van TBR-chaos naar overzicht in één middag 📚 · link in bio`

## Juni-kalender aanpassen?

De huidige `scheduled-posts.json` / `INSTAGRAM-JUNI-2026-QUEUE.md` wijzen vooral naar Remotion (`nl-duplicaat.mp4`, etc.). Voor betere IG-resultaten:

- Vervang Reels waar mogelijk door een **Pilars**-bestand (zelfde thema)
- Carrousels blijven Canva (`docs/CANVA-SLIDES-COPY-PASTE.md`)

## Copy-script (optioneel, PowerShell)

```powershell
cd c:\Projects\shelfieease-booktok-mvp
Copy-Item "TikTok\Pilars\(15) Double Buy.mp4" "public\videos\pilar-double-buy.mp4"
# daarna deploy → publieke URL voor Zernio
```
