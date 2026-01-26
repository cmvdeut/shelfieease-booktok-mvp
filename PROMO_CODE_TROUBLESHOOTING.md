# Promo Code System - Troubleshooting

## ❌ "De lokale link werkt niet"

### Stap 1: Check of dev server draait

**Open een terminal en check:**
```bash
# Ga naar project folder
cd shelfieease-booktok-mvp

# Start dev server (als deze niet draait)
npm run dev
```

Je zou moeten zien:
```
▲ Next.js 16.0.10
- Local:        http://localhost:3000
```

### Stap 2: Test de admin pagina

1. Open: `http://localhost:3000/admin/promo`
2. Klik op "Generate New Code"
3. **Als dit faalt:**
   - Check browser console (F12) voor errors
   - Check terminal voor server errors
   - Zorg dat je op `localhost:3000` bent (niet een andere poort)

### Stap 3: Test de unlock pagina

1. Genereer een code via admin pagina
2. Kopieer de unlock link (bijv. `http://localhost:3000/unlock?code=ABC12345`)
3. Open de link in een **nieuwe browser tab** (of incognito)
4. **Als dit faalt:**
   - Check browser console (F12) voor errors
   - Check of de code correct is (8 karakters, hoofdletters)

### Stap 4: Test API endpoints direct

**Test generate endpoint:**
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/promo/generate" -Method POST
```

**Test validate endpoint:**
```bash
# Vervang CODE met een gegenereerde code
Invoke-WebRequest -Uri "http://localhost:3000/api/promo/validate?code=ABC12345" -Method GET
```

### Stap 5: Veelvoorkomende problemen

#### Probleem: "Failed to generate code"
**Oplossing:**
- Zorg dat dev server draait (`npm run dev`)
- Check of je op `localhost:3000` bent
- Check browser console voor CORS errors

#### Probleem: "Invalid code" bij unlock
**Oplossing:**
- Code moet exact zijn zoals gegenereerd (hoofdletters)
- Code moet 8 karakters zijn
- Code moet via `/api/promo/generate` gegenereerd zijn

#### Probleem: Code werkt niet na server restart
**Oplossing:**
- Codes worden opgeslagen in server memory
- Bij restart gaan codes verloren
- **Workaround**: Genereer nieuwe codes na restart

#### Probleem: Code werkt op server A maar niet op server B
**Oplossing:**
- Elke server instance heeft eigen memory
- Codes zijn niet gedeeld tussen instances
- **Oplossing**: Gebruik database (later uit te breiden)

### Stap 6: Debug mode

**Open browser console (F12) en check:**

1. **Admin pagina:**
   - Klik "Generate New Code"
   - Check console voor errors
   - Check Network tab voor `/api/promo/generate` request

2. **Unlock pagina:**
   - Open unlock link
   - Check console voor errors
   - Check Network tab voor `/api/promo/validate` request

### Stap 7: Check bestanden

Zorg dat deze bestanden bestaan:
- ✅ `app/admin/promo/page.tsx`
- ✅ `app/unlock/page.tsx`
- ✅ `app/api/promo/generate/route.ts`
- ✅ `app/api/promo/validate/route.ts`
- ✅ `lib/promo-storage.ts`

### Stap 8: Herstart dev server

Soms helpt een volledige herstart:

```bash
# Stop dev server (Ctrl+C)
# Start opnieuw
npm run dev
```

## ✅ Werkt het nog steeds niet?

**Check dit:**

1. **Next.js versie:**
   ```bash
   npm list next
   ```
   Moet `16.0.10` of hoger zijn

2. **TypeScript errors:**
   ```bash
   npm run build
   ```
   Check voor compile errors

3. **Port conflict:**
   - Check of poort 3000 beschikbaar is
   - Of gebruik andere poort: `npm run dev -- -p 3001`

4. **Browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) of `Cmd+Shift+R` (Mac)
   - Of gebruik incognito mode

## 🐛 Debug Checklist

- [ ] Dev server draait op `localhost:3000`
- [ ] Geen errors in terminal
- [ ] Geen errors in browser console (F12)
- [ ] API routes bestaan (`/api/promo/generate`, `/api/promo/validate`)
- [ ] Admin pagina laadt (`/admin/promo`)
- [ ] Unlock pagina laadt (`/unlock?code=TEST`)
- [ ] Code is 8 karakters, hoofdletters
- [ ] Code is gegenereerd via admin pagina

## 📞 Nog steeds problemen?

**Stuur deze informatie:**
1. Error message (exacte tekst)
2. Browser console errors (F12 → Console)
3. Terminal output (dev server logs)
4. Welke stap faalt (generate, validate, unlock)

---

**Laat me weten wat de exacte error is en ik help je verder!** 🚀
