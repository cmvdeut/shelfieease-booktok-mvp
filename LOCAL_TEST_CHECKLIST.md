# Lokale Test Checklist - Iconen

## Development Server
- ✅ Server draait op: **http://localhost:3000**

## Test Items

### 1. Favicon in Browser Tab
- [ ] Open http://localhost:3000
- [ ] Check browser tab: zie je het ShelfieEase logo als favicon?
- [ ] Test in verschillende browsers:
  - Chrome/Edge
  - Firefox
  - Safari (als beschikbaar)

### 2. Apple Touch Icon (iOS)
- [ ] Open DevTools (F12)
- [ ] Ga naar **Application** tab > **Manifest**
- [ ] Check of `apple-touch-icon.png` wordt geladen
- [ ] Of test op iPhone/iPad: "Add to Home Screen" → check icon

### 3. PWA Manifest
- [ ] Open DevTools > **Application** > **Manifest**
- [ ] Check:
  - ✅ Name: "ShelfieEase"
  - ✅ Icons: 192x192 en 512x512 aanwezig
  - ✅ Theme color: #6B4EFF
  - ✅ Background color: #0B0B10
  - ✅ Display: "standalone"

### 4. Theme Color
- [ ] Check browser address bar (Chrome/Edge): moet paars zijn (#6B4EFF)
- [ ] Check mobile browser: status bar moet paars zijn

### 5. Favicon Sizes
- [ ] Open DevTools > **Network** tab
- [ ] Refresh pagina (F5)
- [ ] Check of deze bestanden worden geladen:
  - `/favicon.ico`
  - `/favicon-16x16.png`
  - `/favicon-32x32.png`
  - `/apple-touch-icon.png`
  - `/icons/icon-192.png`
  - `/icons/icon-512.png`

### 6. Console Errors
- [ ] Open DevTools > **Console**
- [ ] Check voor 404 errors op icon bestanden
- [ ] Check voor manifest errors

## Snelle Test Commando's

### Check of bestanden bestaan:
```powershell
cd C:\Projects\shelfieease-booktok-mvp
Test-Path "public\favicon.ico"
Test-Path "public\apple-touch-icon.png"
Test-Path "public\icons\icon-192.png"
Test-Path "public\icons\icon-512.png"
```

### Check bestandsgroottes:
```powershell
Get-ChildItem "public" -Filter "favicon*" | Select-Object Name, @{Name="Size (KB)";Expression={[math]::Round($_.Length/1024,2)}}
Get-ChildItem "public\icons" -Filter "icon-*.png" | Select-Object Name, @{Name="Size (KB)";Expression={[math]::Round($_.Length/1024,2)}}
```

## Problemen Oplossen

### Favicon niet zichtbaar?
- Hard refresh: Ctrl+Shift+R (of Cmd+Shift+R op Mac)
- Clear browser cache
- Check Network tab voor 404 errors

### Manifest errors?
- Check `public/manifest.json` syntax
- Check icon paths (moeten beginnen met `/`)
- Check of icon bestanden bestaan

### Theme color niet zichtbaar?
- Check `<meta name="theme-color">` in `app/layout.tsx`
- Check `manifest.json` theme_color

## Volgende Stap
Als alles werkt: **Commit en Deploy** 🚀


