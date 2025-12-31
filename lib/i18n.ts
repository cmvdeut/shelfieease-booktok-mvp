export type UiLang = "nl" | "en";

/**
 * Detect the UI language based on browser settings.
 * Safe for SSR - returns "nl" as default if navigator is undefined.
 */
export function detectUiLang(): UiLang {
  if (typeof navigator === "undefined") {
    return "nl"; // Default for SSR
  }

  // Check navigator.language
  if (navigator.language?.toLowerCase().startsWith("nl")) {
    return "nl";
  }

  // Check navigator.languages array
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      if (lang.toLowerCase().startsWith("nl")) {
        return "nl";
      }
    }
  }

  // Default to English
  return "en";
}

/**
 * Translation function with fallback.
 * Returns the translation for the given language, or falls back to available language.
 */
export function t(dict: { nl: string; en: string }, lang?: UiLang): string {
  const targetLang = lang ?? detectUiLang();
  
  // Try the requested language first
  if (dict[targetLang]) {
    return dict[targetLang];
  }
  
  // Fallback to the other language if available
  if (targetLang === "nl" && dict.en) {
    return dict.en;
  }
  if (targetLang === "en" && dict.nl) {
    return dict.nl;
  }
  
  // Last resort: return the first available value
  return dict.nl || dict.en || "";
}

/**
 * Convenience function to check if UI language is Dutch.
 */
export function isNlUi(): boolean {
  return detectUiLang() === "nl";
}

/**
 * Pay flow translations
 */
const PAY_NL = {
  unlockCta: "Ontgrendel volledig",
  later: "Later",
  demoReachedTitle: "Demo bereikt ✨",
  demoReachedBody: "Je hebt 10 boeken opgeslagen.\nOntgrendel onbeperkt boeken en shelves.",
  checking: "Even checken…",
  unlockedTitle: "Ontgrendeld ✅",
  unlockedBody: "Je hebt nu onbeperkt boeken en shelves.",
  goLibrary: "Ga naar je library",
  notConfirmedTitle: "Betaling niet bevestigd",
  notConfirmedBody: "Als je wél hebt betaald, open dan opnieuw vanuit je Stripe bevestiging.",
  back: "Terug",
  canceledTitle: "Betaling geannuleerd",
  canceledBody: "Geen stress — je kunt altijd later ontgrendelen.",
  backToLibrary: "Terug naar library",
} as const;

const PAY_EN = {
  unlockCta: "Unlock full version",
  later: "Later",
  demoReachedTitle: "Demo limit reached ✨",
  demoReachedBody: "You've saved 10 books.\nUnlock unlimited books and shelves.",
  checking: "Checking…",
  unlockedTitle: "Unlocked ✅",
  unlockedBody: "You now have unlimited books and shelves.",
  goLibrary: "Go to your library",
  notConfirmedTitle: "Payment not confirmed",
  notConfirmedBody: "If you did pay, please reopen the page from your Stripe confirmation.",
  back: "Back",
  canceledTitle: "Payment canceled",
  canceledBody: "No worries — you can unlock anytime.",
  backToLibrary: "Back to library",
} as const;

/**
 * Translation function for pay flow texts.
 * Uses existing isNlUi() logic for language detection.
 */
export function tPay(key: keyof typeof PAY_NL, nlOverride?: boolean): string {
  const nl = typeof nlOverride === "boolean" ? nlOverride : isNlUi();
  return (nl ? PAY_NL : PAY_EN)[key];
}


