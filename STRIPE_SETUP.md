# Stripe Setup Guide

## Opdracht 1: Stripe Dashboard Setup

### 1. Product aanmaken

1. Ga naar [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigeer naar **Products** → **Add product**

**Product configuratie:**
- **Name:** `ShelfieEase Pro`
- **Pricing:** `One-time`
- **Price:** `€4.99`
- **Currency:** `EUR`

3. Klik **Save product**
4. **Kopieer de Price ID** (format: `price_...`) - deze heb je nodig in de code

### 2. API Keys ophalen

1. Ga naar **Developers** → **API keys**
2. **Test mode:**
   - Kopieer **Publishable key** (begint met `pk_test_...`)
   - Kopieer **Secret key** (begint met `sk_test_...`)

3. **Live mode** (later voor productie):
   - Kopieer **Publishable key** (begint met `pk_live_...`)
   - Kopieer **Secret key** (begint met `sk_live_...`)

### 3. Webhook endpoint (later)

1. Ga naar **Developers** → **Webhooks**
2. We maken later een webhook endpoint in de code
3. De webhook secret komt later (format: `whsec_...`)

### 4. Environment Variables

**Lokaal (`.env.local`):**

Maak een `.env.local` bestand in de root van het project met:

```env
# Stripe Secret Key (server-side only)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key (client-side, optional voor directe checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Site URL (voor success/cancel URLs in Checkout Sessions)
NEXT_PUBLIC_SITE_URL=https://www.shelfieease.app

# Stripe Price ID
STRIPE_PRICE_ID=price_...

# Stripe Webhook Secret (opdracht 6 - optioneel voor nu)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Vercel Project Settings:**

1. Ga naar je Vercel project dashboard
2. Navigeer naar **Settings** → **Environment Variables**
3. Voeg dezelfde variabelen toe:
   - `STRIPE_SECRET_KEY` (alle environments)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (alle environments)
   - `NEXT_PUBLIC_SITE_URL` (alle environments)
   - `STRIPE_PRICE_ID` (alle environments)
   - `STRIPE_WEBHOOK_SECRET` (alle environments, later)

**Belangrijk:**
- `NEXT_PUBLIC_SITE_URL` is nodig voor `success_url` en `cancel_url` in Checkout Sessions
- `STRIPE_SECRET_KEY` is server-side only (niet `NEXT_PUBLIC_`)
- `STRIPE_PRICE_ID` is server-side only (niet `NEXT_PUBLIC_`)

### 5. Stripe Checkout

We gebruiken **Stripe Checkout Sessions API** voor de betaling.

**Checklist:**
- [ ] Product "ShelfieEase Pro" aangemaakt
- [ ] Price ID gekopieerd (`price_...`)
- [ ] Test API keys gekopieerd
- [ ] Environment variables toegevoegd aan `.env.local`

**Volgende stap:** Opdracht 2 - Stripe Checkout integratie in code

