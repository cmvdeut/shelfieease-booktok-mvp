# Logo naar Iconen Converteren

## Logo Beschrijving
Het logo dat je wilt gebruiken:
- **Drie overlappende boeken** in groen, rood en blauw
- **Zichtbaar in app header** (linksboven naast "ShelfieEase")
- **Moet gebruikt worden voor alle app iconen**

## Stap 1: Vind het Logo Bestand

Het logo kan zijn:
- Een SVG bestand (bijv. `logo.svg`)
- Een PNG bestand (bijv. `logo.png`, `icon-master.png`)
- Of het moet worden geëxporteerd vanuit je design tool

**Check deze locaties:**
- `/public/icons/icon-master.png` (als dit het logo is)
- `/public/` (zoek naar logo bestanden)
- Design tool export (Figma, etc.)

## Stap 2: Genereer Iconen van Logo

### Optie A: PWA Asset Generator (Aanbevolen)
1. Ga naar: https://www.pwabuilder.com/imageGenerator
2. Upload je logo bestand (512×512 of groter)
3. **Belangrijk**: Selecteer "Maskable" voor Android icons
4. Genereer alle iconen
5. Download en plaats in:
   - `/public/icons/icon-192.png`
   - `/public/icons/icon-512.png`
   - `/public/apple-touch-icon.png`
   - `/public/favicon-32x32.png`
   - `/public/favicon-16x16.png`
   - `/public/favicon.ico`

### Optie B: RealFaviconGenerator
1. Ga naar: https://realfavicongenerator.net/
2. Upload je logo
3. Configureer:
   - Maskable icons: ✅ Aan
   - Padding: 15-20%
   - Transparante achtergrond: ✅
4. Genereer en download
5. Plaats bestanden in project

## Stap 3: Verificatie

Na plaatsing, check:
- [ ] icon-192.png bestaat in `/public/icons/`
- [ ] icon-512.png bestaat in `/public/icons/`
- [ ] apple-touch-icon.png bestaat in `/public/`
- [ ] favicon-32x32.png bestaat in `/public/`
- [ ] favicon-16x16.png bestaat in `/public/`
- [ ] favicon.ico bestaat in `/public/`
- [ ] Alle iconen tonen het logo (drie boeken)
- [ ] Maskable icons hebben 15-20% padding

## Huidige Status

Er zijn al iconen geplaatst, maar deze zijn mogelijk niet gebaseerd op het juiste logo.
Controleer of de huidige iconen het logo tonen (drie overlappende boeken).

Als de iconen niet correct zijn:
1. Vind het logo bestand
2. Genereer nieuwe iconen met PWA Asset Generator
3. Vervang de bestaande iconen

