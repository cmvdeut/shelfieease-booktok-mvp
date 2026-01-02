# Stripe Live Mode Setup - Stap voor Stap

## ⚠️ Belangrijk
- Live mode betekent **echte betalingen** met echte creditcards
- Test eerst goed in test mode voordat je naar live gaat
- Zorg dat je alle environment variables correct hebt ingesteld

## Stap 1: Activeer Live Mode in Stripe Dashboard

1. Ga naar [Stripe Dashboard](https://dashboard.stripe.com)
2. Klik rechtsboven op de toggle om van **"Test mode"** naar **"Live mode"** te gaan
3. Bevestig de switch naar live mode

## Stap 2: Haal Live API Keys op

1. In Stripe Dashboard (nu in Live mode):
   - Ga naar **Developers** → **API keys**
2. Kopieer de **Live keys**:
   - **Publishable key** (begint met `pk_live_...`)
   - **Secret key** (begint met `sk_live_...`)
   - ⚠️ **BELANGRIJK**: Dit zijn andere keys dan test mode!

## Stap 3: Haal Live Price ID op

1. In Stripe Dashboard (Live mode):
   - Ga naar **Products**
   - Selecteer je product (bijv. "ShelfieEase Pro")
   - Kopieer de **Price ID** (begint met `price_...`)
   - ⚠️ **BELANGRIJK**: Live mode heeft een andere Price ID dan test mode!

## Stap 4: Update Environment Variables in Vercel

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je project: `shelfieease-booktok-mvp`
3. Ga naar **Settings** → **Environment Variables**

### Update deze variabelen voor **Production**:

4. **`STRIPE_SECRET_KEY`**:
   - Klik op de bestaande variabele
   - Verander de waarde van `sk_test_...` naar `sk_live_...` (je live secret key)
   - Zorg dat **Production** is geselecteerd
   - Klik **Save**

5. **`STRIPE_PRICE_ID`**:
   - Klik op de bestaande variabele
   - Verander de waarde naar je **live Price ID** (`price_...` uit live mode)
   - Zorg dat **Production** is geselecteerd
   - Klik **Save**

6. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (optioneel):
   - Als je deze hebt, update naar `pk_live_...`
   - Zorg dat **Production** is geselecteerd

### ⚠️ Belangrijk:
- **Preview** en **Development** kunnen test keys blijven gebruiken
- Alleen **Production** moet live keys hebben
- Of: update alle environments als je overal live mode wilt

## Stap 5: Redeploy in Vercel

1. Ga naar **Deployments** in Vercel
2. Klik op de 3 dots (⋯) van de laatste deployment
3. Kies **Redeploy**
4. Of: push een nieuwe commit om automatisch te deployen

## Stap 6: Test met Echte Betaling (Kleine Test)

1. Open je live website: `https://www.shelfieease.app`
2. Test de checkout flow:
   - Voeg 10 boeken toe
   - Klik "Ontgrendel volledig"
   - Gebruik een **echte creditcard** (niet test cards!)
3. Controleer:
   - Betaling wordt verwerkt
   - PRO unlock werkt
   - Gebruiker kan meer dan 10 boeken toevoegen

## Stap 7: Monitor Stripe Dashboard

1. Ga naar Stripe Dashboard → **Payments**
2. Controleer dat betalingen binnenkomen
3. Check voor eventuele errors

## Checklist

- [ ] Live mode geactiveerd in Stripe Dashboard
- [ ] Live API keys gekopieerd (`sk_live_...`, `pk_live_...`)
- [ ] Live Price ID gekopieerd (`price_...`)
- [ ] `STRIPE_SECRET_KEY` geüpdatet in Vercel (Production)
- [ ] `STRIPE_PRICE_ID` geüpdatet in Vercel (Production)
- [ ] Vercel deployment gereed
- [ ] Test met echte betaling uitgevoerd
- [ ] Betalingen zichtbaar in Stripe Dashboard

## Troubleshooting

### "Je kaart is geweigerd" met test card
- **Oorzaak**: Je gebruikt test card in live mode
- **Oplossing**: Gebruik een echte creditcard in live mode

### Betaling werkt niet
- Check of environment variables correct zijn ingesteld
- Check Vercel logs voor errors
- Check Stripe Dashboard → Payments voor failed payments

### PRO unlock werkt niet na betaling
- Check browser console voor errors
- Check of `se:pro` wordt gezet: `localStorage.getItem("se:pro")`
- Check of `/library?paid=1` correct wordt geladen

## Terug naar Test Mode

Als je terug wilt naar test mode:
1. Update environment variables in Vercel terug naar test keys
2. Redeploy
3. Test mode in Stripe Dashboard activeren

