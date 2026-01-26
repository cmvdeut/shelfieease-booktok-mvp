# Promo Code System - Unieke Codes Generator

## 🎯 Overzicht

Dit systeem maakt het mogelijk om **unieke promo codes** te genereren en weg te geven voor gratis Pro toegang. Elke code kan maar **één keer** gebruikt worden.

## 🚀 Hoe het werkt

### 1. Admin Pagina: Code Genereren

Ga naar: **`shelfieease.app/admin/promo`**

- Klik op **"Generate New Code"**
- Je krijgt direct een unieke code (bijv. `A7K9M2P4`)
- Klik op **"Copy Link"** om de volledige unlock link te kopiëren
- Of klik op **"Copy Code"** om alleen de code te kopiëren

### 2. Code Delen

Je kunt codes op verschillende manieren delen:

**Optie A: Volledige Link (Aanbevolen)**
```
shelfieease.app/unlock?code=A7K9M2P4
```
- Gebruiker klikt op link → Direct Pro unlocked
- Perfect voor TikTok comments, DMs, etc.

**Optie B: Alleen Code**
```
A7K9M2P4
```
- Gebruiker gaat naar `shelfieease.app/unlock`
- Voert code in (of je maakt een input veld in de app)

### 3. Code Validatie

Wanneer een gebruiker een code gebruikt:
1. Code wordt gevalideerd via `/api/promo/validate`
2. Als geldig → Pro wordt unlocked (`localStorage.setItem("se:pro", "1")`)
3. Code wordt gemarkeerd als "used" (kan niet opnieuw gebruikt worden)
4. Gebruiker wordt doorgestuurd naar library

## 📁 Bestanden

### Admin Interface
- **`app/admin/promo/page.tsx`** - Admin pagina om codes te genereren
  - Toont alle gegenereerde codes
  - Copy-to-clipboard functionaliteit
  - Lokaal opslaan in localStorage (voor overzicht)

### API Endpoints
- **`app/api/promo/generate/route.ts`** - Genereert unieke codes
  - POST: Genereert nieuwe code
  - GET: Lijst alle codes (voor admin)

- **`app/api/promo/validate/route.ts`** - Valideert codes
  - GET: Valideert code en markeert als gebruikt

### Unlock Pagina
- **`app/unlock/page.tsx`** - Publieke unlock pagina
  - Accepteert `?code=XXX` parameter
  - Valideert code
  - Unlockt Pro status
  - Toont success/error berichten

## 🔒 Beveiliging & Opslag

### Huidige Implementatie (MVP)
- **In-memory storage** in API routes
- Codes worden opgeslagen in server memory
- ⚠️ **Let op**: Codes verdwijnen bij server restart (voor productie: database nodig)

### Voor Productie (Later)
1. **Database** (PostgreSQL, MongoDB, etc.)
   - Opslaan van codes
   - Tracking van gebruik
   - Analytics

2. **Redis Cache** (Optioneel)
   - Snelle validatie
   - Distributed storage (meerdere server instances)

3. **Environment Variables** (Tijdelijke oplossing)
   - Voeg codes toe aan `PROMO_CODES` env var (comma-separated)
   - Codes worden geladen bij server start

## 🎨 Code Format

Codes hebben het volgende format:
- **8 karakters**
- **Alleen hoofdletters en cijfers**
- **Geen verwarrende karakters** (0, O, I, 1 zijn verwijderd)
- Voorbeeld: `A7K9M2P4`, `B3M8K2N5`

## 📝 Gebruiksvoorbeelden

### TikTok Giveaway
```
"Win free Pro access! Use code: A7K9M2P4
Link: shelfieease.app/unlock?code=A7K9M2P4
First 10 people get it! 🎁"
```

### Instagram Story
```
"Swipe up for free Pro code! 
Or visit: shelfieease.app/unlock?code=A7K9M2P4"
```

### Direct Message
```
"Hey! Here's your free Pro code: A7K9M2P4
Visit: shelfieease.app/unlock?code=A7K9M2P4
Enjoy! 📚"
```

## 🔧 Technische Details

### Code Generatie
```typescript
// Genereert 8-karakter code
// Format: [A-Z0-9] (geen 0, O, I, 1)
// Uniekheid gegarandeerd binnen server instance
```

### Validatie Flow
```
User → /unlock?code=XXX
  → API: /api/promo/validate?code=XXX
  → Check: bestaat code?
  → Check: al gebruikt?
  → Markeer als gebruikt
  → Unlock Pro (localStorage)
  → Redirect naar /library
```

### Error Handling
- **Invalid code**: Code bestaat niet
- **Already used**: Code is al gebruikt
- **Server error**: Validatie mislukt

## 🚨 Belangrijke Opmerkingen

### ⚠️ Server Restart
- Codes in memory gaan verloren bij server restart
- **Oplossing**: Gebruik database of environment variables voor persistentie

### ⚠️ Meerdere Server Instances
- Elke server instance heeft eigen memory
- Code gegenereerd op server A kan niet gevalideerd worden op server B
- **Oplossing**: Gebruik gedeelde database of Redis

### ✅ Voor Nu (MVP)
- Werkt perfect voor single server instance
- Codes worden lokaal getrackt in admin pagina (localStorage)
- Perfect voor kleine giveaways en testen

## 📈 Toekomstige Verbeteringen

1. **Database integratie**
   - Codes opslaan in database
   - Usage tracking
   - Analytics dashboard

2. **Bulk generatie**
   - Genereer 100 codes tegelijk
   - Export naar CSV
   - Import van codes

3. **Code expiry**
   - Codes kunnen vervallen na X dagen
   - Time-limited codes

4. **Usage limits**
   - Max aantal codes per gebruiker
   - Rate limiting

5. **Admin dashboard**
   - Zie welke codes gebruikt zijn
   - Door wie (als je user tracking toevoegt)
   - Wanneer gebruikt

## 🎯 Quick Start

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Ga naar admin pagina**
   ```
   http://localhost:3000/admin/promo
   ```

3. **Genereer code**
   - Klik "Generate New Code"
   - Klik "Copy Link"
   - Deel de link!

4. **Test unlock**
   - Open de link in nieuwe browser/incognito
   - Code wordt gevalideerd
   - Pro wordt unlocked
   - Redirect naar library

## 💡 Tips

- **Genereer codes vooraf** - Maak een batch codes voor de week
- **Track in spreadsheet** - Houd bij welke codes je waar gedeeld hebt
- **Test eerst** - Test altijd een code voordat je het deelt
- **Beveilig admin pagina** - Overweeg password protection voor productie

---

**Klaar om codes te genereren? Ga naar `/admin/promo`!** 🚀
