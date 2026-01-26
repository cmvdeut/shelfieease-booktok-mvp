# Gratis Pro Toegang Opties voor ShelfieEase

## Huidige Situatie

- Pro status wordt opgeslagen in `localStorage` met key `"se:pro"` en waarde `"1"`
- Checkout route heeft al `allow_promotion_codes: true` (Stripe coupons werken al!)
- Er is een `markAsPro()` functie in `lib/demo.ts`

---

## 🎁 Optie 1: Stripe Coupon Codes (AANBEVOLEN) ⭐

### Voordelen:
- ✅ **Geen code wijzigingen nodig** - Stripe coupons werken al!
- ✅ **Professioneel** - Gebruikers zien "100% korting" in checkout
- ✅ **Trackbaar** - Je ziet in Stripe dashboard wie coupons gebruikt
- ✅ **Flexibel** - Kan percentage of vast bedrag zijn
- ✅ **Limits** - Kan max aantal uses instellen
- ✅ **Expiry dates** - Kan vervaldatum instellen

### Hoe het werkt:
1. Maak coupon in Stripe Dashboard
2. Gebruiker gaat naar checkout
3. Gebruiker voert coupon code in
4. Betaling wordt €0,00
5. Normale flow: verify → Pro unlocked

### Implementatie:
**Geen code wijzigingen nodig!** Stripe checkout ondersteunt al coupons.

### Stappen:
1. Ga naar Stripe Dashboard → Products → Coupons
2. Klik "Create coupon"
3. Instellingen:
   - **Name**: "TIKTOK2024" (of andere naam)
   - **Type**: Percentage (100%) of Fixed amount (€0)
   - **Duration**: Once (eenmalig) of Forever
   - **Redemption limits**: Optioneel (bijv. max 100 uses)
   - **Expiration**: Optioneel (bijv. 31 dec 2024)
4. Deel de coupon code op TikTok/Instagram

### Voorbeelden:
- `BOOKTOK100` - 100% korting (gratis)
- `FREEPRO2024` - Gratis Pro voor 2024
- `TIKTOK50` - 50% korting (als je ook gedeeltelijke korting wilt)

---

## 🔗 Optie 2: URL Parameter Unlock (Snel & Eenvoudig)

### Voordelen:
- ✅ **Super snel** - Direct unlock via link
- ✅ **Geen checkout nodig** - Direct Pro
- ✅ **Eenvoudig te delen** - Gewoon link delen
- ⚠️ **Minder veilig** - Iemand kan de code raden (maar kan geheim gehouden worden)

### Implementatie:
Voeg een speciale unlock route toe die Pro status zet.

**Nieuwe pagina**: `app/unlock/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { markAsPro } from "@/lib/demo";

// Lijst van geldige unlock codes (kan ook in env variabele)
const VALID_CODES = [
  "TIKTOK2024",
  "BOOKTOK100",
  "FREEPRO",
  // Voeg meer codes toe
];

export default function UnlockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "success" | "invalid">("checking");

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (!code) {
      setStatus("invalid");
      return;
    }

    // Check of code geldig is
    if (VALID_CODES.includes(code.toUpperCase())) {
      markAsPro();
      setStatus("success");
      
      // Redirect naar library na 2 seconden
      setTimeout(() => {
        router.push("/library");
      }, 2000);
    } else {
      setStatus("invalid");
    }
  }, [searchParams, router]);

  if (status === "checking") {
    return (
      <main style={{ padding: 18, maxWidth: 720, margin: "0 auto" }}>
        <h1>Unlocking...</h1>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main style={{ padding: 18, maxWidth: 720, margin: "0 auto" }}>
        <h1>✅ Pro Unlocked!</h1>
        <p>Redirecting to your library...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 18, maxWidth: 720, margin: "0 auto" }}>
      <h1>❌ Invalid Code</h1>
      <p>This unlock code is not valid.</p>
    </main>
  );
}
```

### Gebruik:
Deel links zoals:
- `shelfieease.app/unlock?code=TIKTOK2024`
- `shelfieease.app/unlock?code=BOOKTOK100`

### Veiligheid:
- Gebruik lange, willekeurige codes
- Of gebruik environment variable voor codes
- Of check tegen database (als je die later toevoegt)

---

## 🎫 Optie 3: Promo Code Input in App (Meer Gebruiksvriendelijk)

### Voordelen:
- ✅ **Gebruiksvriendelijk** - Gebruiker hoeft niet naar checkout
- ✅ **Direct unlock** - Geen Stripe flow nodig
- ✅ **Zichtbaar in app** - Promo code veld in settings of unlock modal

### Implementatie:
Voeg een promo code input toe aan de unlock modal in `app/library/page.tsx`.

**Toevoegen aan unlock modal:**
```tsx
// State toevoegen
const [promoCode, setPromoCode] = useState("");
const [promoError, setPromoError] = useState("");

// Functie toevoegen
const handlePromoCode = () => {
  const validCodes = ["TIKTOK2024", "BOOKTOK100", "FREEPRO"];
  
  if (validCodes.includes(promoCode.toUpperCase())) {
    markAsPro();
    setPromoCode("");
    setPromoError("");
    // Show success toast
    // Close modal
  } else {
    setPromoError("Invalid promo code");
  }
};

// In unlock modal UI toevoegen:
<div>
  <input
    type="text"
    placeholder="Enter promo code"
    value={promoCode}
    onChange={(e) => setPromoCode(e.target.value)}
  />
  <button onClick={handlePromoCode}>Apply</button>
  {promoError && <p style={{ color: "red" }}>{promoError}</p>}
</div>
```

---

## 📧 Optie 4: Email-Based Unlock (Meer Professioneel)

### Voordelen:
- ✅ **Veilig** - Unieke tokens per gebruiker
- ✅ **Trackbaar** - Je weet wie de link gebruikt
- ✅ **Professioneel** - Lijkt op echte product activatie

### Implementatie:
1. Maak een API endpoint die unlock tokens genereert
2. Stuur email met unieke unlock link
3. Link verifieert token en unlockt Pro

**API Route**: `app/api/unlock/route.ts`
```tsx
// Genereer unieke token (bijv. UUID)
// Sla op in database of gebruik JWT
// Stuur email met link: shelfieease.app/unlock?token=xxx
```

**Complexiteit**: Vereist email service (SendGrid, Resend, etc.) en token storage.

---

## 🎁 Optie 5: Social Media Giveaway Codes (Per Platform)

### Voordelen:
- ✅ **Trackbaar** - Je weet welke platform werkt
- ✅ **Exclusief gevoel** - "TikTok exclusive code"
- ✅ **Marketing** - Mensen volgen je voor codes

### Implementatie:
Gebruik Optie 2 (URL parameter) of Optie 3 (Promo code input) met platform-specifieke codes:

```tsx
const PLATFORM_CODES = {
  tiktok: "TIKTOK2024",
  instagram: "INSTA2024",
  twitter: "TWITTER2024",
  youtube: "YOUTUBE2024",
};
```

### Gebruik:
- TikTok post: "Use code TIKTOK2024 for free Pro!"
- Instagram story: "Swipe up for free Pro code"
- YouTube description: "Free Pro code in comments"

---

## ⏰ Optie 6: Time-Limited Free Access

### Voordelen:
- ✅ **Urgentie** - "Limited time offer"
- ✅ **Marketing tool** - "Pro free for 1 month"
- ✅ **Conversie** - Mensen proberen het, blijven betalen

### Implementatie:
Sla expiry date op in localStorage:

```tsx
// In lib/demo.ts
export function markAsProTemporary(days: number = 30) {
  const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
  localStorage.setItem("se:pro", "1");
  localStorage.setItem("se:pro:expiry", expiry.toString());
}

export function isProUser(): boolean {
  try {
    const pro = localStorage.getItem("se:pro") === "1";
    if (!pro) return false;
    
    // Check expiry
    const expiry = localStorage.getItem("se:pro:expiry");
    if (expiry) {
      const expiryDate = parseInt(expiry, 10);
      if (Date.now() > expiryDate) {
        // Expired, remove Pro status
        localStorage.removeItem("se:pro");
        localStorage.removeItem("se:pro:expiry");
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}
```

---

## 🎯 Aanbeveling: Combinatie van Opties

### Beste Aanpak:
1. **Stripe Coupons** (Optie 1) - Voor "officiële" giveaways
   - Professioneel
   - Trackbaar in Stripe
   - Geen code wijzigingen

2. **URL Parameter Unlock** (Optie 2) - Voor snelle, directe unlocks
   - Super snel te implementeren
   - Direct unlock zonder checkout
   - Perfect voor TikTok/Instagram links

3. **Promo Code Input** (Optie 3) - Voor gebruiksvriendelijkheid
   - Gebruikers kunnen code invoeren in app
   - Geen externe link nodig

### Implementatie Prioriteit:
1. **Eerst**: Optie 2 (URL parameter) - Snelst te implementeren
2. **Dan**: Optie 3 (Promo code input) - Betere UX
3. **Ook**: Optie 1 (Stripe coupons) - Werkt al, alleen codes maken

---

## 📝 Quick Start: URL Parameter Unlock

**Wil je dat ik Optie 2 (URL Parameter Unlock) nu implementeer?**

Dit is de snelste manier om gratis Pro toegang te geven:
- ✅ 5 minuten implementatie
- ✅ Direct werkend
- ✅ Geen Stripe nodig voor gratis unlocks
- ✅ Perfect voor TikTok giveaways

**Voorbeeld links die je kunt delen:**
- `shelfieease.app/unlock?code=TIKTOK2024`
- `shelfieease.app/unlock?code=BOOKTOK100`
- `shelfieease.app/unlock?code=FREEPRO`

Laat het weten en ik implementeer het direct! 🚀
