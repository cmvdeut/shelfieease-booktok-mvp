# Stripe Integration Checklist

## ✅ Code Implementation Status

### API Routes
- [x] `/api/checkout` - Creates Stripe Checkout Session
- [x] `/api/verify` - Verifies payment status
- [x] `/api/check-env` - Debug endpoint to check environment variables

### Pages
- [x] `/pay/success` - Success page with payment verification
- [x] `/pay/cancel` - Cancel page

### UI Integration
- [x] Demo limit modal with "Unlock full version" button
- [x] Checkout flow integration in `app/library/page.tsx`
- [x] Error handling and user-friendly messages
- [x] Loading states during checkout

### Local Storage
- [x] `se:pro` key set to "1" on successful payment
- [x] `lib/demo.ts` checks only `se:pro === "1"`

## 🔧 Required Environment Variables in Vercel

### Required (Must Have)
1. **`STRIPE_SECRET_KEY`**
   - Format: `sk_test_...` (test) or `sk_live_...` (production)
   - Get from: Stripe Dashboard → Developers → API keys
   - Environment: Production, Preview, Development

2. **`NEXT_PUBLIC_SITE_URL`**
   - Value: `https://www.shelfieease.app`
   - Used for: success_url and cancel_url in Checkout Sessions
   - Environment: Production, Preview, Development

3. **`STRIPE_PRICE_ID`**
   - Format: `price_...`
   - Get from: Stripe Dashboard → Products → Your Product → Price ID
   - Environment: Production, Preview, Development

### Optional (For Future)
4. **`STRIPE_WEBHOOK_SECRET`**
   - Format: `whsec_...`
   - Get from: Stripe Dashboard → Developers → Webhooks (after webhook setup)
   - Environment: Production, Preview, Development

## 🧪 Testing Checklist

### Before Testing
- [ ] All 3 required environment variables are set in Vercel
- [ ] Variables are set for **Production** environment (not just Development/Preview)
- [ ] Latest code is deployed to Vercel

### Test Steps
1. [ ] Open the app and add 10 books (reach demo limit)
2. [ ] Click "Unlock full version" button
3. [ ] Verify Stripe Checkout page opens
4. [ ] Complete test payment (use Stripe test card: `4242 4242 4242 4242`)
5. [ ] Verify redirect to `/pay/success`
6. [ ] Verify payment is confirmed and user is unlocked
7. [ ] Verify user can add more than 10 books
8. [ ] Test cancel flow (click cancel in Stripe Checkout)
9. [ ] Verify redirect to `/pay/cancel`

### Debug Endpoints
- Check environment variables: `https://www.shelfieease.app/api/check-env`
  - Should return: `{"required": {"STRIPE_SECRET_KEY": true, "NEXT_PUBLIC_SITE_URL": true, "STRIPE_PRICE_ID": true}, "allSet": true}`

## 🐛 Common Issues

### "Payment setup incomplete"
- **Cause**: Missing environment variables
- **Fix**: Check `/api/check-env` to see which variables are missing
- **Action**: Add missing variables in Vercel → Settings → Environment Variables

### "Could not open payment page"
- **Cause**: API route error or network issue
- **Fix**: Check browser console for detailed error
- **Action**: Verify all environment variables are set correctly

### Payment succeeds but user not unlocked
- **Cause**: Verification endpoint issue
- **Fix**: Check `/api/verify` endpoint logs in Vercel
- **Action**: Verify `STRIPE_SECRET_KEY` is correct and has access to Checkout Sessions

## 📝 Stripe Test Cards

For testing in test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future date for expiry, any 3 digits for CVC, any postal code.

## ✅ Final Verification

After setup, verify:
1. [ ] `/api/check-env` shows all required variables as `true`
2. [ ] Checkout button opens Stripe Checkout page
3. [ ] Test payment completes successfully
4. [ ] User is unlocked after payment
5. [ ] Demo limit no longer applies

