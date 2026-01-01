# Iconen Genereren van icon-master.png

## Logo Bestand
- **Bestand**: `/public/icons/icon-master.png`
- **Beschrijving**: Logo met drie overlappende boeken (groen, rood, blauw)
- **Gebruik**: Dit moet gebruikt worden voor ALLE app iconen

## Stap-voor-stap: Genereer Iconen

### Stap 1: PWA Asset Generator (Aanbevolen)

1. **Ga naar**: https://www.pwabuilder.com/imageGenerator

2. **Upload**:
   - Bestand: `C:\Projects\shelfieease-booktok-mvp\public\icons\icon-master.png`
   - Of sleep het bestand naar de website

3. **Configureer**:
   - ✅ **Maskable icons**: AAN (belangrijk voor Android!)
   - ✅ **Padding**: 15-20% (safe zone)
   - ✅ **Transparante achtergrond**: AAN

4. **Genereer**:
   - Klik op "Generate"
   - Download alle iconen

5. **Plaats bestanden**:
   - `icon-192.png` → `/public/icons/icon-192.png`
   - `icon-512.png` → `/public/icons/icon-512.png`
   - `apple-touch-icon.png` → `/public/apple-touch-icon.png`
   - `favicon-32x32.png` → `/public/favicon-32x32.png`
   - `favicon-16x16.png` → `/public/favicon-16x16.png`
   - `favicon.ico` → `/public/favicon.ico`

### Stap 2: Verificatie

Na plaatsing, check:
- [ ] Alle iconen tonen het logo (drie boeken)
- [ ] icon-192.png is 192×192 pixels
- [ ] icon-512.png is 512×512 pixels
- [ ] apple-touch-icon.png is 180×180 pixels
- [ ] favicon-32x32.png is 32×32 pixels
- [ ] favicon-16x16.png is 16×16 pixels
- [ ] Maskable icons hebben padding (logo niet tot de rand)

### Stap 3: Testen

1. **Browser**: Check favicon in tab
2. **Android**: Test PWA install (icon moet drie boeken tonen)
3. **iPhone**: Test "Add to Home Screen" (icon moet drie boeken tonen)

## Alternatief: RealFaviconGenerator

Als PWA Asset Generator niet werkt:
1. Ga naar: https://realfavicongenerator.net/
2. Upload `icon-master.png`
3. Configureer maskable icons met 15-20% padding
4. Genereer en download
5. Plaats bestanden in project

## Belangrijk

- **Maskable icons**: Logo moet binnen 80% van canvas blijven (15-20% padding)
- **Transparantie**: Alle iconen moeten transparante achtergrond hebben
- **Kwaliteit**: Gebruik icon-master.png als source (hoogste kwaliteit)

