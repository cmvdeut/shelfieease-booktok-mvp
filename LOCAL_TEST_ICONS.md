# Lokale Test - Iconen

## Development Server
- ✅ Server: **http://localhost:3000**

## Test Checklist

### 1. Favicon in Browser Tab
- [ ] Open http://localhost:3000
- [ ] Hard refresh: **Ctrl+Shift+R** (of Cmd+Shift+R op Mac)
- [ ] Check browser tab: zie je het nieuwe ShelfieEase logo als favicon?
- [ ] Test in verschillende browsers:
  - Chrome/Edge
  - Firefox
  - Safari (als beschikbaar)

### 2. Apple Touch Icon
- [ ] Open DevTools (F12)
- [ ] Ga naar **Application** tab > **Manifest**
- [ ] Check of `apple-touch-icon.png` wordt geladen
- [ ] Of test op iPhone/iPad: "Add to Home Screen" → check icon

### 3. PWA Manifest
- [ ] Open DevTools > **Application** > **Manifest**
- [ ] Check:
  - ✅ Name: "ShelfieEase"
  - ✅ Icons: 
    - `/icons/android-chrome-192x192.png`
    - `/icons/android-chrome-512x512.png`
  - ✅ Theme color: #6B4EFF
  - ✅ Background color: #0B0B10
  - ✅ Display: "standalone"

### 4. Theme Color
- [ ] Check browser address bar (Chrome/Edge): moet paars zijn (#6B4EFF)
- [ ] Check mobile browser: status bar moet paars zijn

### 5. Network Tab - Check Icon Loading
- [ ] Open DevTools > **Network** tab
- [ ] Refresh pagina (F5)
- [ ] Check of deze bestanden worden geladen (geen 404 errors):
  - `/favicon.ico` ✅
  - `/icons/apple-touch-icon.png` ✅
  - `/icons/android-chrome-192x192.png` ✅
  - `/icons/android-chrome-512x512.png` ✅
  - `/manifest.json` ✅

### 6. Console Errors
- [ ] Open DevTools > **Console**
- [ ] Check voor 404 errors op icon bestanden
- [ ] Check voor manifest errors

### 7. Direct URL Test
Test deze URLs direct in de browser:
- http://localhost:3000/favicon.ico
- http://localhost:3000/icons/apple-touch-icon.png
- http://localhost:3000/icons/android-chrome-192x192.png
- http://localhost:3000/icons/android-chrome-512x512.png
- http://localhost:3000/manifest.json

Alle URLs moeten het nieuwe logo tonen (geen 404 errors).

## Verwachte Structuur

```
/public
  /icons
    ✅ android-chrome-192x192.png
    ✅ android-chrome-512x512.png
    ✅ apple-touch-icon.png
  ✅ favicon.ico
  ✅ manifest.json
```

## Verwachte Links in layout.tsx

```tsx
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

## Problemen Oplossen

### Favicon niet zichtbaar?
- Hard refresh: Ctrl+Shift+R
- Clear browser cache
- Check Network tab voor 404 errors
- Test direct URL: http://localhost:3000/favicon.ico

### Manifest errors?
- Check `public/manifest.json` syntax
- Check icon paths (moeten beginnen met `/icons/`)
- Check of icon bestanden bestaan

### Theme color niet zichtbaar?
- Check `<meta name="theme-color">` in `app/layout.tsx`
- Check `manifest.json` theme_color

## Volgende Stap
Als alles werkt: **Commit en Deploy** 🚀


