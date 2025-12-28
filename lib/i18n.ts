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

