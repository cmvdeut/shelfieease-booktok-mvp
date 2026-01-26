# Admin Password Setup

## 🔒 Beveiliging

De admin pagina (`/admin/promo`) is nu beveiligd met een password. Alleen jij kunt codes genereren.

## ⚙️ Password Instellen

### Lokaal (Development)

1. Maak een `.env.local` bestand in de root van het project (als deze nog niet bestaat)
2. Voeg toe:
   ```
   ADMIN_PASSWORD=jouw_sterke_wachtwoord_hier
   ```
3. Herstart de dev server:
   ```bash
   npm run dev
   ```

### Productie (Vercel)

1. Ga naar Vercel Dashboard → je project
2. Settings → Environment Variables
3. Klik "Add New"
4. Voeg toe:
   - **Name**: `ADMIN_PASSWORD`
   - **Value**: `jouw_sterke_wachtwoord_hier`
   - **Environment**: Production, Preview, Development (alle drie)
5. Klik "Save"
6. **Redeploy** je project (of push een nieuwe commit)

## 🔑 Standaard Password

**⚠️ BELANGRIJK**: Als je geen `ADMIN_PASSWORD` instelt, is het standaard password: `changeme123`

**Dit is onveilig!** Zorg dat je altijd een sterk password instelt in productie.

## 💡 Password Tips

- Gebruik minimaal 12 karakters
- Mix van hoofdletters, kleine letters, cijfers en symbolen
- Gebruik geen persoonlijke informatie
- Gebruik een password manager (bijv. 1Password, Bitwarden)

**Voorbeeld sterk password:**
```
ShelfieEase2024!PromoCodes
```

## 🚪 Inloggen

1. Ga naar: `shelfieease.app/admin/promo` (of `localhost:3000/admin/promo` lokaal)
2. Voer je password in
3. Klik "Login"
4. Je blijft ingelogd totdat je op "Logout" klikt

## 🔐 Session Management

- Je blijft ingelogd zolang je browser tab open is
- Logout verwijdert de authenticatie
- Authenticatie wordt opgeslagen in `localStorage` (client-side only)
- Bij het sluiten van de browser tab moet je opnieuw inloggen

## ⚠️ Beveiligingsopmerkingen

### Huidige Implementatie (MVP)
- ✅ Password check is server-side (veilig)
- ✅ Password wordt niet opgeslagen in client
- ⚠️ Session is client-side (localStorage) - kan worden gemanipuleerd
- ⚠️ Geen rate limiting op login attempts

### Voor Productie (Later)
- [ ] JWT tokens voor session management
- [ ] Rate limiting op login attempts
- [ ] IP whitelist (optioneel)
- [ ] 2FA (two-factor authentication)
- [ ] Audit log (wie heeft codes gegenereerd)

## 🐛 Troubleshooting

### "Invalid password" error
- Check of `ADMIN_PASSWORD` environment variable correct is ingesteld
- Check of je het juiste password invoert (case-sensitive)
- Herstart de dev server na het toevoegen van `.env.local`

### Password werkt niet in productie
- Check of `ADMIN_PASSWORD` is toegevoegd in Vercel
- Check of het is toegevoegd voor **Production** environment (niet alleen Development)
- Redeploy je project na het toevoegen van de variable

### Vergeten password
- Reset het password door de `ADMIN_PASSWORD` environment variable te wijzigen
- Redeploy je project

---

**Zorg dat je altijd een sterk password gebruikt in productie!** 🔒
