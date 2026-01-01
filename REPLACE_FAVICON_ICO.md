# Favicon.ico Vervangen

## Probleem
De `favicon.ico` bevat mogelijk nog het oude logo. We moeten deze vervangen door een versie die is gegenereerd van `icon-192.png`.

## Oplossing

### Optie 1: Online Tool (Aanbevolen)
1. Ga naar: https://realfavicongenerator.net/
2. Upload `public/icons/icon-192.png`
3. Configureer:
   - **Favicon for iOS**: ✅ (Apple Touch Icon)
   - **Favicon for Android Chrome**: ✅
   - **Favicon for Windows**: ✅
   - **Favicon for macOS**: ✅
4. Download het gegenereerde pakket
5. Vervang `public/favicon.ico` met de nieuwe versie

### Optie 2: ImageMagick (Command Line)
Als ImageMagick geïnstalleerd is:
```powershell
cd C:\Projects\shelfieease-booktok-mvp
magick public\icons\icon-192.png -resize 32x32 public\favicon-32x32.png
magick public\icons\icon-192.png -resize 16x16 public\favicon-16x16.png
magick public\icons\icon-192.png -define icon:auto-resize=16,32,48 public\favicon.ico
```

### Optie 3: Python Script (Als Python geïnstalleerd is)
```python
from PIL import Image
import os

# Open icon-192.png
img = Image.open('public/icons/icon-192.png')

# Resize voor verschillende sizes
sizes = [(16, 16), (32, 32), (48, 48)]

# Maak ICO bestand
img.save('public/favicon.ico', format='ICO', sizes=sizes)
```

### Optie 4: Handmatig Kopiëren (Tijdelijk)
Als quick fix, kunnen we `icon-192.png` tijdelijk gebruiken als favicon:
```powershell
Copy-Item "public\icons\icon-192.png" "public\favicon.ico" -Force
```
(Let op: dit werkt niet perfect, maar kan helpen om te testen)

## Verificatie
Na vervanging:
1. Hard refresh: **Ctrl+Shift+R**
2. Check: http://localhost:3000/favicon.ico?v=2
3. Check browser tab voor nieuw logo

## Cache-Busting
Ik heb al `?v=2` toegevoegd aan alle favicon links in `app/layout.tsx`. Dit forceert de browser om de nieuwe versie te laden na cache clear.

