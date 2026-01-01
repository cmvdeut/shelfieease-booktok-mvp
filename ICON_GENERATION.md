# Icon Generation Guide

## Logo Beschrijving
- **Achtergrond**: Donkerpaarse/zwarte cirkel
- **Boek**: Lichtpaars/lavendel cover met crème pagina's, open boek
- **Ster**: Kleine gele/witte sparkle in rechterbovenhoek
- **Tekst**: "ShelfieEase" (niet nodig in iconen, alleen logo elementen)

## Vereiste Iconen

### 1. Android / PWA Icons (Maskable)
- **icon-192.png**: 192×192 pixels
- **icon-512.png**: 512×512 pixels
- **Belangrijk**: 15-20% padding (safe zone)
- **Formaat**: PNG met transparante achtergrond
- **Maskable**: Logo moet binnen 80-85% van het canvas blijven

### 2. Apple Touch Icon
- **apple-touch-icon.png**: 180×180 pixels
- **Formaat**: PNG met transparante achtergrond
- **Afgeronde hoeken**: iOS voegt automatisch afronding toe

### 3. Favicons
- **favicon-32x32.png**: 32×32 pixels
- **favicon-16x16.png**: 16×16 pixels
- **favicon.ico**: ICO formaat (of PNG als fallback)
- **Formaat**: PNG met transparante achtergrond

## Generatie Opties

### Optie 1: Online Tool (Aanbevolen)
1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload je logo
   - Genereer alle iconen automatisch
   - Download en plaats in `/public/icons/` en `/public/`

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Genereert favicons voor alle platforms
   - Inclusief maskable icons

### Optie 2: Figma / Design Tool
1. Maak een 512×512 canvas
2. Plaats logo met 15-20% padding (safe zone)
3. Export als PNG:
   - 512×512 → `icon-512.png`
   - 192×192 → `icon-192.png` (schaal 512×512 naar 192×192)
   - 180×180 → `apple-touch-icon.png`
   - 32×32 → `favicon-32x32.png`
   - 16×16 → `favicon-16x16.png`

### Optie 3: ImageMagick / Script
```bash
# Als je het logo als source hebt (logo.png)
convert logo.png -resize 512x512 -background transparent icon-512.png
convert logo.png -resize 192x192 -background transparent icon-192.png
convert logo.png -resize 180x180 -background transparent apple-touch-icon.png
convert logo.png -resize 32x32 -background transparent favicon-32x32.png
convert logo.png -resize 16x16 -background transparent favicon-16x16.png
```

## Maskable Icon Guidelines

Voor Android maskable icons:
- **Safe zone**: 80% van het canvas (15-20% padding aan alle kanten)
- **Logo moet binnen safe zone blijven**
- **Belangrijk**: Elementen buiten safe zone kunnen worden afgesneden

Voorbeeld voor 512×512:
- Safe zone: 410×410 pixels (80%)
- Padding: 51 pixels aan elke kant (10%)
- Logo moet binnen 410×410 blijven

## Bestandslocaties

Na generatie, plaats de iconen hier:
- `/public/icons/icon-192.png`
- `/public/icons/icon-512.png`
- `/public/apple-touch-icon.png`
- `/public/favicon-32x32.png`
- `/public/favicon-16x16.png`
- `/public/favicon.ico` (of gebruik favicon-32x32.png als .ico)

## Verificatie

Na plaatsing:
1. Check dat alle bestanden bestaan
2. Test in browser (favicon)
3. Test op Android (PWA install)
4. Test op iPhone (Add to Home Screen)

