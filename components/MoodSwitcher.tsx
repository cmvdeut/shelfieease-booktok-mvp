"use client";

import { useState, useEffect, useRef } from "react";
import { getMood, setMood, type Mood } from "./MoodProvider";
import { getActiveShelfId, loadShelves, saveShelves } from "@/lib/storage";

const MOODS: Array<{ value: Mood; label: string; emoji: string }> = [
  { value: "default", label: "Aesthetic", emoji: "✨" },
  { value: "bold", label: "Bold", emoji: "🔥" },
  { value: "calm", label: "Calm", emoji: "🌙" },
];

export function MoodSwitcher() {
  const [currentMood, setCurrentMood] = useState<Mood>("default"); // Start with default for SSR
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load mood after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setCurrentMood(getMood());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Update current mood when it changes (e.g., from another tab)
    const handleStorageChange = () => {
      setCurrentMood(getMood());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [mounted]);

  useEffect(() => {
    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSelectMood = (mood: Mood) => {
    // Save to localStorage (primary source of truth)
    setMood(mood);
    
    // Also update the active shelf's mood for consistency
    const shelfMood = mood === "default" ? "aesthetic" : mood;
    const activeShelfId = getActiveShelfId();
    if (activeShelfId) {
      const shelves = loadShelves();
      const updatedShelves = shelves.map((s) =>
        s.id === activeShelfId ? { ...s, mood: shelfMood as "aesthetic" | "bold" | "calm" } : s
      );
      saveShelves(updatedShelves);
    }
    
    setCurrentMood(mood);
    setIsOpen(false);
  };

  const currentMoodOption = MOODS.find((m) => m.value === currentMood) || MOODS[0];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(21, 21, 28, 0.85)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          fontSize: 24,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          zIndex: 1000,
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
        }}
        aria-label="Change mood"
      >
        {currentMoodOption.emoji}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            bottom: 88,
            right: 20,
            minWidth: 160,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(21, 21, 28, 0.95)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            padding: 8,
            zIndex: 1001,
            display: "grid",
            gap: 4,
          }}
        >
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleSelectMood(mood.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                border: 0,
                background: currentMood === mood.value ? "rgba(109,94,252,0.2)" : "transparent",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (currentMood !== mood.value) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentMood !== mood.value) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: 18 }}>{mood.emoji}</span>
              <span>{mood.label}</span>
              {currentMood === mood.value && (
                <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

