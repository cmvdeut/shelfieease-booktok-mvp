# Environment Variables for Vercel

## Required Variables

Deze variabelen moeten **exact** zo heten in Vercel:

### 1. `STRIPE_SECRET_KEY`
- **Format**: `sk_test_...` (test) of `sk_live_...` (production)
- **Waar**: Stripe Dashboard → Developers → API keys
- **Belangrijk**: 
  - ❌ **NOOIT** `NEXT_PUBLIC_` prefix gebruiken (security risk!)
  - ✅ Alleen gebruikt in server-side API routes (`app/api/**`)
  - ✅ Nooit in client components

### 2. `STRIPE_PRICE_ID`
- **Format**: `price_...`
- **Waar**: Stripe Dashboard → Products → Your Product → Price ID
- **Belangrijk**:
  - ❌ **NOOIT** `NEXT_PUBLIC_` prefix gebruiken
  - ✅ Alleen gebruikt in server-side API routes

### 3. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optioneel voor nu)
- **Format**: `pk_test_...` (test) of `pk_live_...` (production)
- **Waar**: Stripe Dashboard → Developers → API keys
- **Belangrijk**:
  - ✅ **MOET** `NEXT_PUBLIC_` prefix hebben als je het in client code gebruikt
  - ⚠️ Momenteel niet gebruikt (we gebruiken Stripe Checkout, niet Stripe Elements)
  - 📝 Voor toekomstig gebruik als je Stripe Elements wilt gebruiken

## Security Checklist

- [x] `STRIPE_SECRET_KEY` wordt alleen gebruikt in `app/api/**` routes (server-side)
- [x] Geen `process.env.STRIPE_SECRET_KEY` in client components
- [x] Geen `process.env.STRIPE_PUBLISHABLE_KEY` zonder `NEXT_PUBLIC_` prefix
- [x] Alle Stripe secret keys zijn server-side only

## Vercel Setup

1. Ga naar Vercel Dashboard → je project
2. Settings → Environment Variables
3. Voeg toe voor **Production**, **Preview**, en **Development**:
   - `STRIPE_SECRET_KEY` = `sk_test_...` of `sk_live_...`
   - `STRIPE_PRICE_ID` = `price_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` of `pk_live_...` (optioneel)

4. **Redeploy** na het toevoegen van variabelen


