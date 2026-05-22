export type UiLang = "nl" | "en";

export const UI_LANG_STORAGE_KEY = "se:uiLang";

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

const PAY_NL: Record<keyof typeof PAY_EN, string> = {
  unlockCta: "Ontgrendel voor €4,99",
  later: "Niet nu",
  demoReachedTitle: "Je shelf is vol 📚",
  demoReachedBody: "Je hebt 10 boeken gescand — de gratis demolimiet.\nOntgrendel ShelfieEase om door te gaan.",
  demoFeature1: "Onbeperkt boeken & shelves",
  demoFeature2: "Eigen shelfnamen & emoji's",
  demoFeature3: "Deel mooie shelfie cards",
  demoOneTime: "Eenmalige betaling · voor altijd van jou",
  waitlistLabel: "Nog niet klaar? Laat je e-mail achter voor acties:",
  waitlistPlaceholder: "jouw@email.com",
  waitlistCta: "Meld me aan",
  waitlistSuccess: "Je staat op de lijst!",
  checking: "Even checken…",
  unlockedTitle: "Ontgrendeld ✅",
  unlockedBody: "Je hebt nu onbeperkt boeken en shelves.",
  goLibrary: "Ga naar je bibliotheek",
  notConfirmedTitle: "Betaling niet bevestigd",
  notConfirmedBody: "Als je wél hebt betaald, open dan opnieuw vanuit je Stripe-bevestiging.",
  back: "Terug",
  canceledTitle: "Betaling geannuleerd",
  canceledBody: "Geen stress — je kunt altijd later ontgrendelen.",
  backToLibrary: "Terug naar bibliotheek",
};

function browserPrefersDutch(): boolean {
  if (typeof navigator === "undefined") return true;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return langs.some((l) => l && l.toLowerCase().startsWith("nl"));
}

/** Read persisted UI language (client only). */
export function getStoredUiLang(): UiLang | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(UI_LANG_STORAGE_KEY);
    if (v === "nl" || v === "en") return v;
  } catch {
    // ignore
  }
  return null;
}

/** Default: Dutch. English only when user chose it in settings. */
export function detectUiLang(): UiLang {
  const stored = getStoredUiLang();
  if (stored) return stored;
  if (typeof window === "undefined") return "nl";
  void browserPrefersDutch;
  return "nl";
}

export function setUiLang(lang: UiLang): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UI_LANG_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
    document.documentElement.dataset.uiLang = lang;
  }
  window.dispatchEvent(new CustomEvent("uilangchange", { detail: { lang } }));
}

export function t(dict: { nl: string; en: string }, lang?: UiLang): string {
  const l = lang ?? detectUiLang();
  return l === "nl" ? dict.nl : dict.en;
}

export function isNlUi(lang?: UiLang): boolean {
  return (lang ?? detectUiLang()) === "nl";
}

export function tPay(key: keyof typeof PAY_EN, lang?: UiLang): string {
  const l = lang ?? detectUiLang();
  return l === "nl" ? PAY_NL[key] : PAY_EN[key];
}

export function applyDocumentUiLang(lang: UiLang): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dataset.uiLang = lang;
}
