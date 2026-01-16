"use client";

import { useEffect } from "react";
import { detectUiLang } from "@/lib/i18n";

const STORAGE_KEY = "se:mood";
const DEFAULT_MOOD = "aesthetic";

function getMoodFromStorage(): string {
  if (typeof window === "undefined") return DEFAULT_MOOD;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "default" || stored === "bold" || stored === "calm" || stored === "aesthetic") {
      return stored;
    }
    return DEFAULT_MOOD;
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
  
  // Get mood from localStorage (default to "aesthetic" if nothing)
  const storedMood = getMoodFromStorage();
  
  // Map "aesthetic" to "default" for dataset.mood (dataset only accepts "default", "bold", "calm")
  const datasetMood = storedMood === "aesthetic" ? "default" : storedMood;
  
  // Get UI language
  const lang = detectUiLang();
  
  // Set dataset attributes
  document.documentElement.dataset.mood = datasetMood;
  document.documentElement.dataset.uiLang = lang;
  document.documentElement.lang = lang;
}

export default function UiBoot() {
  useEffect(() => {
    // Apply initial settings on mount
    applyUiSettings();
    
    // Listen for mood changes from the app (via moodchange event)
    function handleMoodChange(event: CustomEvent) {
      const newMood = event.detail?.mood || getMoodFromStorage();
      
      // Save to localStorage
      saveMoodToStorage(newMood);
      
      // Update dataset (map "aesthetic" to "default")
      if (typeof document !== "undefined") {
        const datasetMood = newMood === "aesthetic" ? "default" : newMood;
        document.documentElement.dataset.mood = datasetMood;
      }
    }
    
    // Listen for custom moodchange event
    window.addEventListener("moodchange", handleMoodChange as EventListener);
    
    // Also listen for storage events (sync across tabs)
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        applyUiSettings();
      }
    }
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("moodchange", handleMoodChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  return null;
}

