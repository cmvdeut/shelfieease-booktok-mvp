"use client";

import { useEffect, useRef } from "react";
import { getActiveShelfId, loadShelves } from "@/lib/storage";

// Shelf mood type (from storage)
type ShelfMood = "aesthetic" | "bold" | "calm";
// Document mood type (for dataset.mood)
export type Mood = "default" | "bold" | "calm";

const DEFAULT_SHELF_MOOD: ShelfMood = "aesthetic";
const DEFAULT_MOOD: Mood = "default";
const STORAGE_KEY = "se:mood";

function getMoodFromStorage(): Mood | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "default" || stored === "bold" || stored === "calm") {
      return stored as Mood;
    }
    return null;
  } catch {
    return null;
  }
}

function saveMoodToStorage(mood: Mood) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, mood);
  } catch {
    // Ignore storage errors
  }
}

function getMoodFromActiveShelf(): Mood {
  if (typeof window === "undefined") return DEFAULT_MOOD;
  try {
    const activeShelfId = getActiveShelfId();
    if (!activeShelfId) return DEFAULT_MOOD;

    const shelves = loadShelves();
    if (shelves.length === 0) return DEFAULT_MOOD;

    const activeShelf = shelves.find((s) => s.id === activeShelfId);
    if (!activeShelf) return DEFAULT_MOOD;

    const shelfMood = activeShelf.mood || DEFAULT_SHELF_MOOD;
    // Validate shelf mood is one of the allowed values
    if (shelfMood === "aesthetic" || shelfMood === "bold" || shelfMood === "calm") {
      // Map shelf mood to document mood (shelf uses "aesthetic", document uses "default")
      return shelfMood === "aesthetic" ? "default" : shelfMood;
    }

    return DEFAULT_MOOD;
  } catch {
    return DEFAULT_MOOD;
  }
}

function getCurrentMood(): Mood {
  // Priority: 1) localStorage "se:mood", 2) active shelf mood, 3) default
  const storedMood = getMoodFromStorage();
  if (storedMood) return storedMood;
  
  const shelfMood = getMoodFromActiveShelf();
  return shelfMood;
}

function applyMood(mood: Mood) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.mood = mood;
  saveMoodToStorage(mood);
}

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const lastActiveShelfIdRef = useRef<string | null>(null);
  const lastStoredMoodRef = useRef<Mood | null>(null);

  useEffect(() => {
    // Apply initial mood (priority: localStorage > active shelf > default)
    const initialMood = getCurrentMood();
    applyMood(initialMood);
    lastActiveShelfIdRef.current = getActiveShelfId();
    lastStoredMoodRef.current = getMoodFromStorage();

    // Poll for changes in active shelf or localStorage mood (every 500ms)
    const intervalId = setInterval(() => {
      const currentStoredMood = getMoodFromStorage();
      const currentActiveShelfId = getActiveShelfId();
      
      // Check if stored mood changed
      if (currentStoredMood && currentStoredMood !== lastStoredMoodRef.current) {
        applyMood(currentStoredMood);
        lastStoredMoodRef.current = currentStoredMood;
        return;
      }
      
      // If active shelf changed, update mood (but only if no stored mood exists)
      if (currentActiveShelfId !== lastActiveShelfIdRef.current) {
        if (!currentStoredMood) {
          const newMood = getMoodFromActiveShelf();
          applyMood(newMood);
        }
        lastActiveShelfIdRef.current = currentActiveShelfId;
      } else {
        // Even if shelf ID didn't change, shelf.mood might have changed
        // Check and update if needed (but only if no stored mood exists)
        if (!currentStoredMood) {
          const currentMood = getMoodFromActiveShelf();
          const currentDocumentMood = document.documentElement.dataset.mood || "default";
          
          if (currentDocumentMood !== currentMood) {
            applyMood(currentMood);
          }
        }
      }
    }, 500);

    // Also listen for storage events (sync across tabs)
    function handleStorageChange(e: StorageEvent) {
      // Listen for changes to mood storage
      if (e.key === STORAGE_KEY) {
        const newStoredMood = getMoodFromStorage();
        if (newStoredMood) {
          applyMood(newStoredMood);
          lastStoredMoodRef.current = newStoredMood;
        }
      }
      // Listen for changes to shelves or active shelf (only if no stored mood)
      if ((e.key === "shelfieease_shelves_v1" || e.key === "shelfieease_active_shelf_v1") && !getMoodFromStorage()) {
        const newMood = getMoodFromActiveShelf();
        applyMood(newMood);
        lastActiveShelfIdRef.current = getActiveShelfId();
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <>{children}</>;
}

// Export helper functions
export function getMood(): Mood {
  return getCurrentMood();
}
export function setMood(mood: Mood) {
  // Save to localStorage and apply immediately
  if (typeof window === "undefined") return;
  applyMood(mood);
}


