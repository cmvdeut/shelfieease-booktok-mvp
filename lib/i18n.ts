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
  unlockCta: "Unlock for €4.99",
  later: "Not now",
  demoReachedTitle: "Your shelf is full 📚",
  demoReachedBody: "You've scanned 10 books — the free demo limit.\nUnlock ShelfieEase to keep scanning and building shelves.",
  demoFeature1: "Unlimited books & shelves",
  demoFeature2: "Custom shelf names & emojis",
  demoFeature3: "Share beautiful shelfie cards",
  demoOneTime: "One-time payment · yours forever",
  waitlistLabel: "Not ready? Get notified about promos:",
  waitlistPlaceholder: "your@email.com",
  waitlistCta: "Notify me",
  waitlistSuccess: "You're on the list!",
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
  unlockCta: "Ontgrendel voor €4,99",
  later: "Niet nu",
  demoReachedTitle: "Je shelf is vol 📚",
  demoReachedBody: "Je hebt 10 boeken gescand — de gratis demolimiet.\nOntgrendel ShelfieEase om door te gaan.",
  demoFeature1: "Onbeperkt boeken & shelves",
  demoFeature2: "Eigen shelfnamen & emoji's",
  demoFeature3: "Deel mooie shelfie cards",
  demoOneTime: "Eenmalige betaling · voor altijd van jou",
  waitlistLabel: "Nog niet klaar? Laat je email achter voor acties:",
  waitlistPlaceholder: "jouw@email.com",
  waitlistCta: "Meld me aan",
  waitlistSuccess: "Je staat op de lijst!",
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


