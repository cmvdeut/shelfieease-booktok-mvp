export type UiLang = "nl" | "en";

/**
 * Detect the UI language based on browser settings.
 * Safe for SSR - returns "en" as default if navigator is undefined.
 * App is always in English - books keep their original language.
 */
export function detectUiLang(): UiLang {
  // App is always in English
  return "en";
}

/**
 * Translation function - always returns English.
 * App UI is English-only for consistency.
 */
export function t(dict: { nl: string; en: string }, lang?: UiLang): string {
  // Always return English, regardless of lang parameter
  void lang; // Reserved for future i18n
  return dict.en || dict.nl || "";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for i18n completeness
const PAY_NL: Record<keyof typeof PAY_EN, string> = {
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
};

/**
 * Translation function for pay flow texts.
 * Always returns English for consistency.
 */
export function tPay(key: keyof typeof PAY_EN, nlOverride?: boolean): string {
  void nlOverride; // Reserved for future nl override
  return PAY_EN[key];
}


