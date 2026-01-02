"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getMood, type Mood } from "@/components/MoodProvider";
import { detectUiLang, t } from "@/lib/i18n";
import { isProUser } from "@/lib/demo";

// Headlines per mood with NL/EN
const headlines = {
  default: {
    nl: "Maak je eigen boekenshelf in seconden.",
    en: "Build your bookshelf in seconds.",
  },
  bold: {
    nl: "Scan. Orden. Deel je boeken.",
    en: "Scan. Sort. Share your books.",
  },
  calm: {
    nl: "Al je boeken, rustig op één plek.",
    en: "All your books, calmly in one place.",
  },
};

// Subheadlines per mood with NL/EN
const subheadlines = {
  default: {
    nl: "Scan een ISBN of typ 'm in. Zet boeken in shelves. Klaar.",
    en: "Scan an ISBN or type it in. Sort into shelves. Done.",
  },
  bold: {
    nl: "In seconden van barcode naar overzicht.",
    en: "From barcode to bookshelf in seconds.",
  },
  calm: {
    nl: "Scan of voeg toe. Jij bepaalt het tempo.",
    en: "Scan or add. You set the pace.",
  },
};

// Helper function to get headline based on mood and language
function getHeadlineByMood(mood: Mood | null, lang: ReturnType<typeof detectUiLang>): string {
  const effectiveMood = mood || "default";
  const dict = headlines[effectiveMood] || headlines.default;
  return t(dict, lang);
}

// Helper function to get subheadline based on mood and language
function getSubHeadlineByMood(mood: Mood | null, lang: ReturnType<typeof detectUiLang>): string {
  const effectiveMood = mood || "default";
  const dict = subheadlines[effectiveMood] || subheadlines.default;
  return t(dict, lang);
}

export default function HomePage() {
  // Always start with "default" to match server render and avoid hydration mismatch
  const [currentMood, setCurrentMood] = useState<Mood>("default");
  const [isMounted, setIsMounted] = useState(false);
  // Initialize isPro immediately on client to ensure demo notice is always visible
  const [isPro, setIsPro] = useState(() => {
    if (typeof window === "undefined") return false;
    return isProUser();
  });
  
  // Detect UI language
  const lang = detectUiLang();

  // Set initial mood after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const initialMood = getMood();
    setCurrentMood(initialMood);
    // Also check PRO status on mount to ensure it's up to date
    setIsPro(isProUser());
  }, []);

  // Listen for mood changes to update headlines live
  useEffect(() => {
    if (!isMounted) return;

    const handleMoodChange = () => {
      const newMood = getMood();
      setCurrentMood(newMood);
    };
    
    // Listen for custom moodchange event
    window.addEventListener("moodchange", handleMoodChange);
    
    // Also check on mount and periodically (as fallback)
    const intervalId = setInterval(() => {
      const newMood = getMood();
      if (newMood !== currentMood) {
        setCurrentMood(newMood);
      }
      // Also check PRO status
      const newProStatus = isProUser();
      if (newProStatus !== isPro) {
        setIsPro(newProStatus);
      }
    }, 100);
    
    return () => {
      window.removeEventListener("moodchange", handleMoodChange);
      clearInterval(intervalId);
    };
  }, [currentMood, isMounted, isPro]);
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)" }} data-ui-lang={lang}>
      {/* Background glow - mood-aware via CSS vars */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: 0 }}>
        <div style={{
          position: "absolute",
          top: -96,
          left: -96,
          width: 288,
          height: 288,
          borderRadius: "50%",
          background: `radial-gradient(circle, color-mix(in srgb, var(--accent1) 25%, transparent), transparent)`,
          filter: "blur(64px)",
        }} />
        <div style={{
          position: "absolute",
          top: 160,
          right: -96,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, color-mix(in srgb, var(--accent2) 20%, transparent), transparent)`,
          filter: "blur(64px)",
        }} />
        <div style={{
          position: "absolute",
          bottom: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 384,
          height: 384,
          borderRadius: "50%",
          background: `radial-gradient(circle, color-mix(in srgb, var(--accent1) 10%, transparent), transparent)`,
          filter: "blur(64px)",
        }} />
      </div>

      <div style={{ position: "relative", maxWidth: 448, margin: "0 auto", padding: "28px 24px 36px" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <img 
            src="/brand/v2/logo-mark.png" 
            alt="ShelfieEase" 
            style={{ 
              height: "100px",
              width: "fit-content",
              objectFit: "contain",
              position: "relative",
              zIndex: 1,
              flexShrink: 0
            }}
          />

          <div>
            <h1 style={{ fontSize: "clamp(1.875rem, 2.5rem, 2.25rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1 }}>
              ShelfieEase
            </h1>
            <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted)", lineHeight: 1.2 }}>
              {t({ nl: "Scan · Shelf · Deel", en: "Scan · Shelf · Share" }, lang)}
            </p>
          </div>
        </header>

        {/* Hero */}
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)", fontWeight: 600, lineHeight: 1.25, color: "var(--text)" }}>
            {getHeadlineByMood(currentMood, lang)}
          </h2>
          <p style={{ marginTop: 8, fontSize: "clamp(0.875rem, 1rem, 1rem)", color: "var(--muted)" }}>
            {getSubHeadlineByMood(currentMood, lang)}
          </p>

          {/* Actions */}
          <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
            <Link
              href="/scan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 16,
                padding: "14px 20px",
                fontSize: "clamp(1rem, 1.125rem, 1.125rem)",
                fontWeight: 600,
                background: "var(--btnPrimaryBg)",
                boxShadow: `0 8px 24px var(--shadow)`,
                border: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 20 }}>📷</span>
              {t({ nl: "Scan een boek", en: "Scan a book" }, lang)}
              <span style={{ opacity: 0.8 }}>→</span>
            </Link>

            {/* Device compatibility info - only show for demo users */}
            {!isPro && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "var(--panel2)",
                  border: "1px solid var(--border)",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--muted)",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--muted)" }}>
                      {t({ nl: "Let op", en: "Please note" }, lang)}
                    </div>
                    <div style={{ color: "var(--muted2)" }}>
                      {t(
                        {
                          nl: "ShelfieEase werkt op de meeste moderne telefoons, maar niet elke camera of barcode wordt even goed ondersteund. Daarom kun je de app eerst in demo gebruiken — zo weet je zeker of het voor jouw toestel prettig werkt.",
                          en: "The demo helps you test whether scanning works well on your device, as camera quality and barcode formats can vary.",
                        },
                        lang
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Link
                href="/library"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: 16,
                  padding: "10px 16px",
                  fontSize: "clamp(0.875rem, 1rem, 1rem)",
                  fontWeight: 600,
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  boxShadow: `0 4px 12px var(--shadow)`,
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <span>📚</span> {t({ nl: "Mijn shelf", en: "My Shelf" }, lang)}
              </Link>

              <Link
                href="/scan"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: 16,
                  padding: "10px 16px",
                  fontSize: "clamp(0.875rem, 1rem, 1rem)",
                  fontWeight: 600,
                  background: "var(--panel2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <span>⌨️</span> {t({ nl: "Handmatig", en: "Manual" }, lang)}
              </Link>
            </div>
          </div>

          {/* Compact feature chips */}
          <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 16,
              background: "var(--panel2)",
              border: "1px solid var(--border)",
              padding: "10px 16px",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t({ nl: "Geen stress stats", en: "No stress stats" }, lang)}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {t({ nl: "TBR • Bezig • Gelezen", en: "TBR • Reading • Finished" }, lang)}
                </div>
              </div>
              <div style={{
                display: "grid",
                height: 36,
                width: 36,
                placeItems: "center",
                borderRadius: 16,
                background: "var(--panel)",
                border: "1px solid var(--border)",
              }}>
                ✨
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 16,
              background: "var(--panel2)",
              border: "1px solid var(--border)",
              padding: "10px 16px",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t({ nl: "Shelves met emoji", en: "Shelves with emoji" }, lang)}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {t({ nl: "Mini-collecties (📖🌙🔥💜)", en: "Mini-collections (📖🌙🔥💜)" }, lang)}
                </div>
              </div>
              <div style={{
                display: "grid",
                height: 36,
                width: 36,
                placeItems: "center",
                borderRadius: 16,
                background: "var(--panel)",
                border: "1px solid var(--border)",
              }}>
                🧺
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 16,
              background: "var(--panel2)",
              border: "1px solid var(--border)",
              padding: "10px 16px",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t({ nl: "Deel je Shelfie", en: "Share your Shelfie" }, lang)}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {t({ nl: "9:16 share-card", en: "9:16 share-card" }, lang)}
                </div>
              </div>
              <div style={{
                display: "grid",
                height: 36,
                width: 36,
                placeItems: "center",
                borderRadius: 16,
                background: "var(--panel)",
                border: "1px solid var(--border)",
              }}>
                🪄
              </div>
            </div>
          </div>

          <footer style={{ marginTop: 16, fontSize: 11, color: "var(--muted)", opacity: 0.7 }}>
            {t({ nl: "Tip: Handmatig invoeren blijft altijd mogelijk.", en: "Tip: Manual entry is always possible." }, lang)}
          </footer>
        </section>
      </div>
    </main>
  );
}
