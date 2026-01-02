"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";

// Detect if device is iOS
function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// Detect if device is Android
function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export default function PaySuccessPage() {
  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [lang, setLang] = useState<"nl" | "en">("en");

  // Detect browser language on client side
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const browserLang = navigator.language?.toLowerCase() || "";
      if (browserLang.startsWith("nl")) {
        setLang("nl");
      } else {
        setLang("en");
      }
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      setStatus("fail");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data?.paid) {
          localStorage.setItem("se:pro", "1");
          setStatus("ok");
        } else {
          setStatus("fail");
        }
      } catch {
        setStatus("fail");
      }
    })();
  }, []);

  // Install modal content
  const installModalContent = (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
    }} onClick={() => setShowInstallModal(false)}>
      <div style={{
        backgroundColor: "var(--panelSolid)",
        borderRadius: 24,
        padding: 24,
        maxWidth: 400,
        width: "100%",
        border: "1px solid var(--border)",
        boxShadow: `0 8px 32px var(--shadow)`,
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
            {t({ nl: "Installeren op homescreen", en: "Install on homescreen" }, lang)}
          </h2>
          <button
            onClick={() => setShowInstallModal(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              color: "var(--muted)",
              cursor: "pointer",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {isIOS() ? (
          <div style={{ color: "var(--text)" }}>
            <p style={{ marginBottom: 16, color: "var(--muted)" }}>
              {t({ 
                nl: "Voeg ShelfieEase toe aan je homescreen:", 
                en: "Add ShelfieEase to your homescreen:" 
              }, lang)}
            </p>
            <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              <li>{t({ nl: "Tik op de deel-knop", en: "Tap the share button" }, lang)} <span style={{ fontSize: 18 }}>📤</span></li>
              <li>{t({ nl: "Scroll naar beneden en tik op", en: "Scroll down and tap" }, lang)} <strong>{t({ nl: "\"Voeg toe aan beginscherm\"", en: "\"Add to Home Screen\"" }, lang)}</strong></li>
              <li>{t({ nl: "Bevestig door op", en: "Confirm by tapping" }, lang)} <strong>{t({ nl: "\"Toevoegen\"", en: "\"Add\"" }, lang)}</strong> {t({ nl: "te tikken", en: "" }, lang)}</li>
            </ol>
          </div>
        ) : isAndroid() ? (
          <div style={{ color: "var(--text)" }}>
            <p style={{ marginBottom: 16, color: "var(--muted)" }}>
              {t({ 
                nl: "Voeg ShelfieEase toe aan je homescreen:", 
                en: "Add ShelfieEase to your homescreen:" 
              }, lang)}
            </p>
            <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              <li>{t({ nl: "Tik op het menu (3 puntjes)", en: "Tap the menu (3 dots)" }, lang)} <span style={{ fontSize: 18 }}>⋮</span></li>
              <li>{t({ nl: "Selecteer", en: "Select" }, lang)} <strong>{t({ nl: "\"Toevoegen aan beginscherm\"", en: "\"Add to Home screen\"" }, lang)}</strong></li>
              <li>{t({ nl: "Bevestig door op", en: "Confirm by tapping" }, lang)} <strong>{t({ nl: "\"Toevoegen\"", en: "\"Add\"" }, lang)}</strong> {t({ nl: "te tikken", en: "" }, lang)}</li>
            </ol>
          </div>
        ) : (
          <div style={{ color: "var(--text)" }}>
            <p style={{ color: "var(--muted)" }}>
              {t({ 
                nl: "Op desktop kun je ShelfieEase installeren via het menu van je browser.", 
                en: "On desktop, you can install ShelfieEase via your browser's menu." 
              }, lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main style={{ 
      minHeight: "100dvh", 
      background: "var(--bg)", 
      color: "var(--text)",
      padding: "28px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {status === "checking" && (
        <div style={{ textAlign: "center", maxWidth: 448 }}>
          <p style={{ fontSize: 18, color: "var(--muted)" }}>
            {t({ nl: "Even checken…", en: "Checking…" }, lang)}
          </p>
        </div>
      )}

      {status === "ok" && (
        <div style={{ 
          maxWidth: 448, 
          width: "100%",
          textAlign: "center",
        }}>
          {/* Success Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ 
              fontSize: "clamp(2rem, 3rem, 2.5rem)", 
              fontWeight: 800, 
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              marginBottom: 12,
              color: "var(--text)",
            }}>
              {t({ nl: "Ontgrendeld ✨", en: "Unlocked ✨" }, lang)}
            </h1>
            <p style={{ 
              fontSize: "clamp(1rem, 1.125rem, 1.125rem)", 
              color: "var(--muted)",
              lineHeight: 1.5,
            }}>
              {t({ nl: "Onbeperkt boeken en shelves", en: "Unlimited books and shelves" }, lang)}
            </p>
          </div>

          {/* 3-Step Guide */}
          <div style={{
            background: "var(--panel2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
            textAlign: "left",
          }}>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: "var(--muted)",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {t({ nl: "Zo werkt het", en: "How it works" }, lang)}
            </div>
            
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>📷</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    {t({ nl: "Scan een boek", en: "Scan a book" }, lang)}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>
                    {t({ nl: "Of voer ISBN handmatig in", en: "Or enter ISBN manually" }, lang)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>🗂️</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    {t({ nl: "Kies een shelf", en: "Choose a shelf" }, lang)}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>
                    {t({ nl: "Of maak een nieuwe shelf aan", en: "Or create a new shelf" }, lang)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>✨</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    {t({ nl: "Deel je Shelfie", en: "Share your Shelfie" }, lang)}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>
                    {t({ nl: "Als je wil, deel je mooie shelfie", en: "If you want, share your beautiful shelfie" }, lang)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action */}
          <Link
            href="/library"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 16,
              padding: "16px 24px",
              fontSize: "clamp(1rem, 1.125rem, 1.125rem)",
              fontWeight: 600,
              background: "var(--btnPrimaryBg)",
              boxShadow: `0 8px 24px var(--shadow)`,
              border: "1px solid var(--border)",
              color: "var(--btnPrimaryText)",
              textDecoration: "none",
              width: "100%",
              marginBottom: 12,
            }}
          >
            {t({ nl: "Ga naar My Shelf", en: "Go to My Shelf" }, lang)}
            <span style={{ opacity: 0.8 }}>→</span>
          </Link>

          {/* Secondary Action */}
          <button
            onClick={() => setShowInstallModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 16,
              padding: "12px 20px",
              fontSize: "clamp(0.875rem, 1rem, 1rem)",
              fontWeight: 500,
              background: "var(--btnGhostBg)",
              border: "1px solid var(--btnGhostBorder)",
              color: "var(--text)",
              textDecoration: "none",
              width: "100%",
              cursor: "pointer",
            }}
          >
            {t({ nl: "Installeren op homescreen", en: "Install on homescreen" }, lang)}
          </button>
        </div>
      )}

      {status === "fail" && (
        <div style={{ textAlign: "center", maxWidth: 448 }}>
          <h1 style={{ 
            fontSize: "clamp(1.5rem, 2rem, 1.875rem)", 
            fontWeight: 700,
            marginBottom: 12,
            color: "var(--text)",
          }}>
            {t({ nl: "Betaling niet bevestigd", en: "Payment not confirmed" }, lang)}
          </h1>
          <p style={{ 
            color: "var(--muted)", 
            marginBottom: 24,
            lineHeight: 1.5,
          }}>
            {t({ 
              nl: "Als je wél hebt betaald, open dan opnieuw vanuit je Stripe bevestiging.", 
              en: "If you did pay, please reopen the page from your Stripe confirmation." 
            }, lang)}
          </p>
          <Link 
            href="/library" 
            style={{ 
              color: "var(--accent)", 
              textDecoration: "underline",
              fontSize: 16,
            }}
          >
            {t({ nl: "Terug naar library", en: "Back to library" }, lang)}
          </Link>
        </div>
      )}

      {showInstallModal && installModalContent}
    </main>
  );
}
