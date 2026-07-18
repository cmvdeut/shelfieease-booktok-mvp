"use client";

import { useEffect } from "react";
import { clearChunkReloadAttempts } from "@/lib/chunk-reload";
import { detectUiLang, UI_LANG_STORAGE_KEY } from "@/lib/i18n";

const STORAGE_KEY = "se:mood";
const DEFAULT_MOOD = "light";

// Maps old 3-mood values (from before the "Modern Bookish Romance" redesign)
// to the new 2-mode system, so existing users' localStorage doesn't break.
function normalizeLegacyMood(value: string): "light" | "dark" {
  if (value === "light" || value === "dark") return value;
  if (value === "calm") return "light";
  return "dark"; // "default" / "aesthetic" / "bold"
}

function getMoodFromStorage(): string {
  if (typeof window === "undefined") return DEFAULT_MOOD;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_MOOD;
    return normalizeLegacyMood(stored);
  } catch {
    return DEFAULT_MOOD;
  }
}

function saveMoodToStorage(mood: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, mood);
  } catch {
    // Ignore storage errors
  }
}

function applyUiSettings() {
  if (typeof document === "undefined") return;
  
  // Get mood from localStorage (default to "light" if nothing)
  const datasetMood = getMoodFromStorage();

  // Get UI language
  const lang = detectUiLang();
  
  // Set dataset attributes
  document.documentElement.dataset.mood = datasetMood;
  document.documentElement.dataset.uiLang = lang;
  document.documentElement.lang = lang;
}

export default function UiBoot() {
  useEffect(() => {
    clearChunkReloadAttempts();
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("_se")) {
        url.searchParams.delete("_se");
        const next = url.pathname + url.search + url.hash;
        window.history.replaceState({}, "", next);
      }
    } catch {
      // ignore
    }

    // Apply initial settings on mount
    applyUiSettings();
    
    // Listen for mood changes from the app (via moodchange event)
    function handleMoodChange(event: CustomEvent) {
      const newMood = event.detail?.mood || getMoodFromStorage();
      
      // Save to localStorage
      saveMoodToStorage(newMood);

      // Update dataset
      if (typeof document !== "undefined") {
        document.documentElement.dataset.mood = normalizeLegacyMood(newMood);
      }
    }
    
    // Listen for custom moodchange event
    window.addEventListener("moodchange", handleMoodChange as EventListener);
    
    // Also listen for storage events (sync across tabs)
    function handleLangChange() {
      applyUiSettings();
    }

    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY || e.key === UI_LANG_STORAGE_KEY) {
        applyUiSettings();
      }
    }
    
    window.addEventListener("uilangchange", handleLangChange);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("moodchange", handleMoodChange as EventListener);
      window.removeEventListener("uilangchange", handleLangChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  return null;
}

