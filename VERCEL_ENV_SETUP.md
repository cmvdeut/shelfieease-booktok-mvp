# Vercel Environment Variables Setup

## Stripe Integration Variables

Voeg deze environment variables toe in je Vercel project:

### Stap 1: Ga naar Vercel Dashboard
1. Open je project: https://vercel.com/dashboard
2. Selecteer het `shelfieease-booktok-mvp` project
3. Ga naar **Settings** → **Environment Variables**

### Stap 2: Voeg variabelen toe

Klik op **Add New** en voeg deze variabelen toe (voor **Production**, **Preview**, en **Development**):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` (of `sk_live_...` voor productie) | All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (of `pk_live_...` voor productie) | All |
| `NEXT_PUBLIC_SITE_URL` | `https://www.shelfieease.app` | All |
| `STRIPE_PRICE_ID` | `price_...` | All |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (later, na webhook setup) | All |

### Stap 3: Redeploy

Na het toevoegen van de variabelen:
1. Ga naar **Deployments**
2. Klik op de 3 dots van de laatste deployment
3. Kies **Redeploy**

Of push een nieuwe commit om automatisch te deployen.

### Checklist

- [ ] `STRIPE_SECRET_KEY` toegevoegd
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` toegevoegd
- [ ] `NEXT_PUBLIC_SITE_URL` toegevoegd
- [ ] `STRIPE_PRICE_ID` toegevoegd
- [ ] Deployment gereed

