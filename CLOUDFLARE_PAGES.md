# Cloudflare Pages Deployment

Deze app kan worden gedeployed naar Cloudflare Pages met static export.

## ⚠️ Belangrijk: Beperkingen

**Wat WEL werkt:**
- ✅ Alle frontend functionaliteit (Home, Scan, Library)
- ✅ Menu, backup/restore, privacy/help pagina's
- ✅ Alle client-side features
- ✅ Boeken toevoegen, shelves beheren
- ✅ LocalStorage functionaliteit

**Wat NIET werkt:**
- ❌ Stripe API routes (`/api/checkout`, `/api/verify`) - vereist server-side
- ❌ Betalingen - werkt alleen op Vercel of andere server-side hosting

**Aanbeveling:**
- Gebruik Cloudflare Pages voor **frontend testing**
- Gebruik **Vercel voor productie** (met Stripe betalingen)

## Setup via Cloudflare Dashboard

1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com) > **Pages**
2. Klik **"Create a project"** > **"Connect to Git"**
3. Selecteer je GitHub repository: `cmvdeut/shelfieease-booktok-mvp`
4. Configureer build settings:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build:cf`
   - **Build output directory**: `out`
   - **Root directory**: `shelfieease-booktok-mvp` (als het in een monorepo staat)
5. **Environment variables**: Geen nodig (alles is client-side)
6. Klik **"Save and Deploy"**

## Custom Domain Setup

Na deployment kun je een custom domain toevoegen:

1. Ga naar je project in Cloudflare Pages
2. Klik op **"Custom domains"**
3. Voeg toe: `www.shelfieease.app`
4. Cloudflare configureert automatisch DNS en SSL

**Redirects:**
- Redirects worden geconfigureerd via Cloudflare Dashboard > **Rules** > **Redirect Rules**
- Of via DNS CNAME records die naar het Cloudflare Pages project wijzen

## Deploy via CLI (lokaal testen)

1. Installeer Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login:
   ```bash
   wrangler login
   ```

3. Build het project:
   ```bash
   cd shelfieease-booktok-mvp
   npm run build:cf
   ```

4. Deploy:
   ```bash
   wrangler pages deploy out --project-name=shelfieease-booktok-mvp
   ```

## Hoe het werkt

- Wanneer `CF_PAGES=1` environment variable is gezet, bouwt Next.js een static export
- Alle pagina's zijn client-side rendered (`"use client"`), dus static export werkt perfect
- Output gaat naar `out/` directory die Cloudflare Pages serveert
- Middleware werkt niet met static export, maar redirects kunnen via Cloudflare Dashboard worden geconfigureerd

## Troubleshooting

### Build faalt
- Controleer of alle pagina's `"use client"` hebben
- Zorg dat er geen server-side code wordt gebruikt
- Check de build logs in Cloudflare Dashboard

### Redirects werken niet
- Configureer redirects via Cloudflare Dashboard > Rules > Redirect Rules
- Of gebruik DNS CNAME records

### API routes werken niet
- Dit is normaal - API routes werken alleen met server-side rendering
- Gebruik Vercel voor productie als je Stripe betalingen nodig hebt


