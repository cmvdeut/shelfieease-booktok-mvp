# Stripe Test vs Live Mode - Troubleshooting

## Foutmelding: "Je kaart is geweigerd. Je aanvraag vond plaats in de livemodus, maar er is een bekende testkaart gebruikt."

### Probleem
Deze fout treedt op wanneer:
- **Stripe is in LIVE mode** (`sk_live_...` key) maar je gebruikt een **test card** (`4242 4242 4242 4242`)
- OF: **Stripe is in TEST mode** (`sk_test_...` key) maar je gebruikt een **live card**

### Oplossing

#### Optie 1: Gebruik Test Mode (aanbevolen voor ontwikkeling)
1. Ga naar Vercel Dashboard → je project → Settings → Environment Variables
2. Controleer `STRIPE_SECRET_KEY`:
   - Moet beginnen met `sk_test_...` (test mode)
   - NIET `sk_live_...` (live mode)
3. Gebruik Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
   - Elke toekomstige datum voor expiry
   - Elke 3 cijfers voor CVC

#### Optie 2: Gebruik Live Mode (alleen voor productie)
1. Zorg dat `STRIPE_SECRET_KEY` begint met `sk_live_...`
2. Gebruik een **echte creditcard** (niet test cards)
3. ⚠️ **Waarschuwing**: Live mode betekent echte betalingen!

### Check Stripe Mode

**In Stripe Dashboard:**
1. Ga naar https://dashboard.stripe.com
2. Kijk rechtsboven: staat er "Test mode" of "Live mode"?
3. Ga naar Developers → API keys
4. Check welke key je gebruikt:
   - Test keys beginnen met `sk_test_...` en `pk_test_...`
   - Live keys beginnen met `sk_live_...` en `pk_live_...`

**In Vercel:**
1. Ga naar je project → Settings → Environment Variables
2. Check `STRIPE_SECRET_KEY`:
   - `sk_test_...` = Test mode
   - `sk_live_...` = Live mode

### Aanbeveling

Voor ontwikkeling en testen:
- ✅ Gebruik **Test mode** (`sk_test_...`)
- ✅ Gebruik **test cards** (`4242 4242 4242 4242`)
- ✅ Geen echte betalingen

Voor productie:
- ✅ Gebruik **Live mode** (`sk_live_...`)
- ✅ Gebruik **echte creditcards**
- ⚠️ Test eerst goed in test mode!

### Test Cards (Test Mode Only)

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure required |

**Expiry**: Elke toekomstige datum (bijv. 12/25)
**CVC**: Elke 3 cijfers (bijv. 123)
**Postal Code**: Elke code

