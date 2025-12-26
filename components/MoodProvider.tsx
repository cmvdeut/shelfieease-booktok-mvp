"use client";

import { useEffect } from "react";

export type Mood = "aesthetic" | "bold" | "calm";

const STORAGE_KEY = "se:mood";
const DEFAULT_MOOD: Mood = "aesthetic";

export function getMood(): Mood {
  if (typeof window === "undefined") return DEFAULT_MOOD;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "aesthetic" || stored === "bold" || stored === "calm") {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_MOOD;
}

export function setMood(mood: Mood) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, mood);
    applyMood(mood);
  } catch {
    // ignore
  }
}

function applyMood(mood: Mood) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.mood = mood;
}

export function MoodProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply initial mood
    const initialMood = getMood();
    applyMood(initialMood);

    // Listen for storage events (sync across tabs)
    function handleStorageChange(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newMood = e.newValue as Mood;
        if (newMood === "aesthetic" || newMood === "bold" || newMood === "calm") {
          applyMood(newMood);
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}


