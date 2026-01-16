# Icon Requirements - ShelfieEase

## Logo Elementen (uit beschrijving)
- **Achtergrond**: Donkerpaarse/zwarte cirkel
- **Boek**: Lichtpaars/lavendel cover met crème pagina's, open boek
- **Ster**: Kleine gele/witte sparkle in rechterbovenhoek
- **Kleuren**: 
  - Donkerpaars: `#6B4EFF` of donkerder
  - Lichtpaars: Lavendel tint
  - Crème: Off-white pagina's
  - Geel/Wit: Sparkle

## Vereiste Iconen

### 1. Android / PWA Icons (Maskable - BELANGRIJK!)
**icon-192.png** (192×192 pixels)
**icon-512.png** (512×512 pixels)

**Maskable Requirements:**
- ✅ **Padding: 15-20%** (safe zone)
- ✅ Logo moet binnen **80-85%** van canvas blijven
- ✅ Voor 512×512: logo binnen 410×410 pixels (80%)
- ✅ Voor 192×192: logo binnen 154×154 pixels (80%)
- ✅ Transparante achtergrond
- ✅ PNG formaat

**Waarom maskable?**
- Android kan iconen in verschillende vormen tonen (cirkel, vierkant, etc.)
- Safe zone zorgt dat logo nooit wordt afgesneden

### 2. Apple Touch Icon
**apple-touch-icon.png** (180×180 pixels)
- ✅ Transparante achtergrond
- ✅ Licht afgeronde hoeken (iOS voegt automatisch toe)
- ✅ PNG formaat

### 3. Favicons
**favicon-32x32.png** (32×32 pixels)
**favicon-16x16.png** (16×16 pixels)
**favicon.ico** (ICO formaat, of PNG als fallback)
- ✅ Transparante achtergrond
- ✅ Licht afgeronde hoeken
- ✅ PNG formaat

## Generatie Tools

### Aanbevolen: PWA Asset Generator
1. Ga naar: https://www.pwabuilder.com/imageGenerator
2. Upload je logo (512×512 of groter)
3. Selecteer "Maskable" voor Android icons
4. Genereer alle iconen
5. Download en plaats in `/public/icons/` en `/public/`

### Alternatief: RealFaviconGenerator
1. Ga naar: https://realfavicongenerator.net/
2. Upload je logo
3. Configureer maskable icons (15-20% padding)
4. Genereer en download
5. Plaats bestanden in project

## Bestandslocaties

Na generatie, plaats hier:
```
/public/icons/icon-192.png
/public/icons/icon-512.png
/public/apple-touch-icon.png
/public/favicon-32x32.png
/public/favicon-16x16.png
/public/favicon.ico
```

## Verificatie Checklist

- [ ] icon-192.png bestaat (192×192, maskable met padding)
- [ ] icon-512.png bestaat (512×512, maskable met padding)
- [ ] apple-touch-icon.png bestaat (180×180)
- [ ] favicon-32x32.png bestaat (32×32)
- [ ] favicon-16x16.png bestaat (16×16)
- [ ] favicon.ico bestaat
- [ ] Alle iconen hebben transparante achtergrond
- [ ] Maskable icons hebben 15-20% padding
- [ ] Manifest.json heeft `"purpose": "any maskable"` voor PWA icons

## Testen

1. **Browser**: Check favicon in tab
2. **Android**: Test PWA install (icon moet correct zijn)
3. **iPhone**: Test "Add to Home Screen" (icon moet correct zijn)


