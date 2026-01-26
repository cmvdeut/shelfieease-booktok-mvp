# Upstash Redis Setup voor Promo Codes

## 🎯 Waarom Upstash?

- ✅ **Gratis tier**: 10,000 requests/dag (meer dan genoeg voor promo codes)
- ✅ **Serverless**: Werkt perfect met Vercel
- ✅ **Automatisch**: Codes worden direct opgeslagen, geen handmatige stappen
- ✅ **Werkt overal**: Codes zijn beschikbaar op alle server instances

## 📝 Stap 1: Maak Upstash Account

1. Ga naar [upstash.com](https://upstash.com)
2. Klik "Sign Up" (gratis account)
3. Login met GitHub of email

## 🔧 Stap 2: Maak Redis Database

1. In Upstash Dashboard, klik "Create Database"
2. Kies:
   - **Name**: `shelfieease-promo-codes` (of andere naam)
   - **Type**: Regional (gratis) of Global (betaald)
   - **Region**: Kies dichtbij (bijv. `eu-west-1` voor Europa)
3. Klik "Create"

## 🔑 Stap 3: Kopieer Credentials

Na het aanmaken zie je:
- **UPSTASH_REDIS_REST_URL**: `https://...`
- **UPSTASH_REDIS_REST_TOKEN**: `...`

Kopieer beide!

## ⚙️ Stap 4: Voeg toe aan Vercel

1. Ga naar Vercel Dashboard → je project
2. Settings → Environment Variables
3. Klik "Add New"
4. Voeg toe:
   - **Name**: `UPSTASH_REDIS_REST_URL`
   - **Value**: De URL die je kopieerde
   - **Environment**: Production, Preview, Development
5. Klik "Add New" opnieuw
6. Voeg toe:
   - **Name**: `UPSTASH_REDIS_REST_TOKEN`
   - **Value**: De token die je kopieerde
   - **Environment**: Production, Preview, Development
7. Klik "Save"
8. **Redeploy** je project

## 🧪 Stap 5: Test Lokaal (Optioneel)

Voor lokaal testen, maak `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Start dev server:
```bash
npm run dev
```

## ✅ Klaar!

Nu werkt het zo:
1. Je genereert code via `/admin/promo`
2. Code wordt **automatisch** opgeslagen in Upstash
3. Code werkt direct op alle server instances
4. Geen handmatige stappen meer nodig!

## 📊 Monitoring

In Upstash Dashboard kun je zien:
- Aantal requests
- Database size
- Usage statistics

## 💰 Kosten

- **Gratis tier**: 10,000 requests/dag
- **Voor promo codes**: Meer dan genoeg (elke code = 1-2 requests)
- **Upgrade**: Alleen nodig als je >10k requests/dag hebt

## 🐛 Troubleshooting

### Codes werken niet
- Check of environment variables correct zijn ingesteld
- Check Upstash Dashboard voor errors
- Check Vercel logs voor API errors

### "Redis not available" warning
- Check of `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN` zijn ingesteld
- System valt terug op memory storage (werkt alleen opzelfde server instance)

---

**Na setup: Alle codes die je genereert werken automatisch, overal!** 🚀
