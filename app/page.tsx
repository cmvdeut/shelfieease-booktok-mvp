"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getMood, type Mood } from "@/components/MoodProvider";
import { detectUiLang, t } from "@/lib/i18n";
import { isProUser } from "@/lib/demo";
import { trackEvent } from "@/lib/analytics";

// Headlines per mood with NL/EN
const headlines = {
  default: {
    nl: "Scan je boekenkast. Nooit meer twijfelen of je het al hebt.",
    en: "Scan your bookshelf. Never wonder if you already own it.",
  },
  bold: {
    nl: "Scan je boekenkast. Nooit meer twijfelen of je het al hebt.",
    en: "Scan your bookshelf. Never wonder if you already own it.",
  },
  calm: {
    nl: "Scan je boekenkast. Nooit meer twijfelen of je het al hebt.",
    en: "Scan your bookshelf. Never wonder if you already own it.",
  },
};

// Subheadlines per mood with NL/EN
const subheadlines = {
  default: {
    nl: "Voorkom dubbele aankopen, zet je TBR op orde en deel een shelfie voor BookTok. Geen download. Geen account. Gratis tot 10 boeken.",
    en: "Avoid duplicate buys, organize your TBR in minutes, and share a shelfie made for BookTok. No download. No sign-up. Free up to 10 books.",
  },
  bold: {
    nl: "Voorkom dubbele aankopen, zet je TBR op orde en deel een shelfie voor BookTok. Geen download. Geen account. Gratis tot 10 boeken.",
    en: "Avoid duplicate buys, organize your TBR in minutes, and share a shelfie made for BookTok. No download. No sign-up. Free up to 10 books.",
  },
  calm: {
    nl: "Voorkom dubbele aankopen, zet je TBR op orde en deel een shelfie voor BookTok. Geen download. Geen account. Gratis tot 10 boeken.",
    en: "Avoid duplicate buys, organize your TBR in minutes, and share a shelfie made for BookTok. No download. No sign-up. Free up to 10 books.",
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

function HomePageInner() {
  const searchParams = useSearchParams();
  const utmSource = searchParams.get("utm_source")?.toLowerCase() ?? "";

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

  const socialWelcome =
    utmSource === "tiktok"
      ? t({ nl: "Welkom, BookTokker 📚", en: "Welcome, BookTokker 📚" }, lang)
      : utmSource === "instagram"
        ? t({ nl: "Welkom van Instagram 📚", en: "Welcome from Instagram 📚" }, lang)
        : null;

  // Set initial mood after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const initialMood = getMood();
    setCurrentMood(initialMood);
    setIsPro(isProUser());
    trackEvent("landing_view");
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
          {/* Social proof badge */}
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--muted)",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "4px 10px",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
              {t({ nl: "Gratis te testen • Geen account nodig", en: "Free to try • No sign-up needed" }, lang)}
            </span>
          </div>

          {socialWelcome && (
            <p style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: "var(--accent1)" }}>
              {socialWelcome}
            </p>
          )}

          {/* Headline + shelfie card mockup side by side */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)", fontWeight: 600, lineHeight: 1.25, color: "var(--text)" }}>
                {getHeadlineByMood(currentMood, lang)}
              </h2>
              <p style={{ marginTop: 8, fontSize: "clamp(0.875rem, 1rem, 1rem)", color: "var(--muted)" }}>
                {getSubHeadlineByMood(currentMood, lang)}
              </p>
            </div>

            {/* 9:16 shelfie card mockup */}
            <div style={{
              flexShrink: 0,
              width: 108,
              height: 192,
              borderRadius: 14,
              background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(109,94,252,0.2)",
              display: "flex",
              flexDirection: "column",
              padding: "10px 8px 8px",
              gap: 6,
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(109,94,252,0.3), transparent)",
                pointerEvents: "none",
              }} />

              {/* Card header */}
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "0.03em" }}>
                My Shelf 📚
              </div>

              {/* Book covers */}
              <div style={{ display: "flex", gap: 4, flex: 1 }}>
                {/* Column 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <div style={{ borderRadius: 4, flex: "0 0 52px", background: "linear-gradient(135deg, #e96c7f, #c0392b)", opacity: 0.9 }} />
                  <div style={{ borderRadius: 4, flex: "0 0 40px", background: "linear-gradient(135deg, #6d5efc, #a855f7)", opacity: 0.9 }} />
                  <div style={{ borderRadius: 4, flex: 1, background: "linear-gradient(135deg, #22c55e, #16a34a)", opacity: 0.85 }} />
                </div>
                {/* Column 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  <div style={{ borderRadius: 4, flex: "0 0 36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", opacity: 0.9 }} />
                  <div style={{ borderRadius: 4, flex: "0 0 56px", background: "linear-gradient(135deg, #38bdf8, #0284c7)", opacity: 0.9 }} />
                  <div style={{ borderRadius: 4, flex: 1, background: "linear-gradient(135deg, #fb923c, #ea580c)", opacity: 0.85 }} />
                </div>
              </div>

              {/* Card footer */}
              <div style={{
                fontSize: 7, color: "rgba(255,255,255,0.5)",
                textAlign: "center", letterSpacing: "0.04em", fontWeight: 600,
              }}>
                @shelfieease
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
            <Link
              href="/scan"
              onClick={() => trackEvent("cta_start_free_click")}
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
            <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: -2 }}>
              {t(
                {
                  nl: "Minder dan één dubbele aankoop — €4,99 eenmalig",
                  en: "Less than the cost of one duplicate purchase — €4.99 one-time",
                },
                lang
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted2)", opacity: 0.7, textAlign: "center", marginTop: 4 }}>
              {t({ nl: "Handmatig invoeren blijft altijd mogelijk.", en: "Manual entry is always possible." }, lang)}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
              <Link href="/privacy" style={{ fontSize: 11, color: "var(--muted2)", textDecoration: "underline" }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ fontSize: 11, color: "var(--muted2)", textDecoration: "underline" }}>
                Terms of Service
              </Link>
            </div>

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
                      <div style={{ marginTop: 8, fontWeight: 500 }}>
                        {t(
                          {
                            nl: "Demo-versie · max. 10 boeken",
                            en: "Demo version · max. 10 books",
                          },
                          lang
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isPro && (
              <p style={{ marginTop: 8, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                {t({ nl: "Unlock onbeperkt:", en: "Unlock unlimited:" }, lang)}{" "}
                <Link
                  href="/library"
                  style={{ fontWeight: 600, color: "var(--accent1)", textDecoration: "underline" }}
                >
                  €4,99 {t({ nl: "eenmalig", en: "one-time" }, lang)}
                </Link>
              </p>
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

          {/* Features section */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: "var(--text)", 
              marginBottom: 12,
              letterSpacing: "0.01em"
            }}>
              {t({ nl: "Features", en: "Features" }, lang)}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}>
                <div style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>✨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>
                    {t({ nl: "No-stress reading stats", en: "No-stress reading stats" }, lang)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.4 }}>
                    {t({ nl: "TBR · Reading · Finished", en: "TBR · Reading · Finished" }, lang)}
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}>
                <div style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>🧺</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>
                    {t({ nl: "Emoji shelves", en: "Emoji shelves" }, lang)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.4 }}>
                    {t({ nl: "Create mini collections", en: "Create mini collections" }, lang)}
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}>
                <div style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>🪄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>
                    {t({ nl: "Share your Shelfie", en: "Share your Shelfie" }, lang)}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.4 }}>
                    {t({ nl: "9:16 share card", en: "9:16 share card" }, lang)}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
            <a
              href="https://www.tiktok.com/@shelfieease"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ShelfieEase on TikTok"
              style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 13, textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
              TikTok
            </a>
            <a
              href="https://www.instagram.com/shelfieease/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ShelfieEase on Instagram"
              style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 13, textDecoration: "none" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              Instagram
            </a>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted2)", marginBottom: 8 }}>
            Built with love for book lovers 📚
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 12, color: "var(--muted2)", textDecoration: "none" }}>Privacy policy</a>
            <a href="/terms" style={{ fontSize: 12, color: "var(--muted2)", textDecoration: "none" }}>Terms of service</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
