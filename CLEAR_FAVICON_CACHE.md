# Favicon Cache Opschonen

## Probleem
De browser toont nog steeds het oude favicon omdat het gecached is.

## Oplossing

### Methode 1: Hard Refresh (Snelste)
1. Open http://localhost:3000
2. Druk op **Ctrl+Shift+R** (Windows/Linux) of **Cmd+Shift+R** (Mac)
3. Of: **Ctrl+F5**

### Methode 2: Browser Cache Clearen
**Chrome/Edge:**
1. Open DevTools (F12)
2. Rechtsklik op de refresh knop
3. Kies "Empty Cache and Hard Reload"

**Firefox:**
1. Open DevTools (F12)
2. Rechtsklik op de refresh knop
3. Kies "Empty Cache and Hard Reload"

**Safari:**
1. Cmd+Option+E (clear cache)
2. Cmd+Shift+R (hard refresh)

### Methode 3: Direct Testen
Open deze URLs direct in de browser:
- http://localhost:3000/favicon.ico?v=2
- http://localhost:3000/favicon-32x32.png?v=2
- http://localhost:3000/apple-touch-icon.png?v=2

Als je het nieuwe logo ziet, werkt het! Dan is het alleen een cache probleem.

### Methode 4: Incognito/Private Window
1. Open een nieuw incognito/private venster
2. Ga naar http://localhost:3000
3. Check of het nieuwe favicon zichtbaar is

## Cache-Busting Toegevoegd
Ik heb `?v=2` toegevoegd aan alle favicon links in `app/layout.tsx`. Dit forceert de browser om de nieuwe versie te laden.

## Verificatie
Na cache clearen, check:
- ✅ Favicon in browser tab
- ✅ Apple Touch Icon (DevTools > Application > Manifest)
- ✅ Theme color in address bar


