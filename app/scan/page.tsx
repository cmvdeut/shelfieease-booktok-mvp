"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Scanner from "@/components/Scanner";
import { t } from "@/lib/i18n";
import { useUiLang } from "@/components/UiLangProvider";
import { canAddBook, isProUser } from "@/lib/demo";
import { trackEvent } from "@/lib/analytics";

function normalizeIsbn(raw: string) {
  return raw.toUpperCase().replace(/[^0-9X]/g, "");
}

export default function ScanPage() {
  const router = useRouter();
  const { lang } = useUiLang();
  const [manual, setManual] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [hasIsbnParam, setHasIsbnParam] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const manualNormalized = useMemo(() => normalizeIsbn(manual), [manual]);

  useEffect(() => {
    trackEvent("scan_started");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const isbnParam = params.get("isbn");
    if (isbnParam) {
      const normalized = normalizeIsbn(isbnParam);
      if (normalized) {
        setHasIsbnParam(true);
        router.replace(`/library?addIsbn=${encodeURIComponent(normalized)}`);
      }
    }
  }, [router]);

  const onDetected = useCallback(
    (isbn: string) => {
      setLastScan(isbn);
      trackEvent("scan_success");

      if (!canAddBook()) {
        router.push(`/library?showDemoLimit=true`);
        return;
      }

      router.push(`/library?addIsbn=${encodeURIComponent(isbn)}`);
    },
    [router]
  );

  const submitManual = useCallback(() => {
    const v = manualNormalized;
    if (!v) return;
    trackEvent("manual_isbn_used");

    if (!canAddBook()) {
      router.push(`/library?showDemoLimit=true`);
      return;
    }

    router.push(`/library?addIsbn=${encodeURIComponent(v)}`);
  }, [manualNormalized, router]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "16px 16px calc(88px + env(safe-area-inset-bottom, 0px))",
        paddingTop: "env(safe-area-inset-top, 16px)",
        background: "var(--bg)",
        color: "var(--text)",
      }}
      className="scan-page-container"
    >
      <div style={{ marginBottom: 18 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted2)",
          }}
        >
          {t({ nl: "Ontdek", en: "Discover" }, lang)}
        </p>
        <h1
          style={{
            margin: "6px 0 0",
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: 30,
            fontWeight: 700,
            color: "var(--deepBurgundy)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {t({ nl: "Ontdek nieuwe boeken", en: "Discover new books" }, lang)}
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 15, lineHeight: 1.45, maxWidth: 360 }}>
          {t(
            {
              nl: "Scan de barcode. We checken of hij al op je plank staat.",
              en: "Scan the barcode. We'll check if it's already on your shelf.",
            },
            lang
          )}
        </p>
      </div>

      {hasIsbnParam ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 14,
            borderRadius: 24,
            background: "var(--panelSolid)",
            border: "1px solid var(--border)",
          }}
        >
          {t({ nl: "ISBN wordt verwerkt…", en: "Processing ISBN…" }, lang)}
        </div>
      ) : (
        <div
          style={{
            borderRadius: 24,
            padding: 12,
            background:
              "linear-gradient(160deg, color-mix(in srgb, var(--accent1) 88%, #3a0f1c), color-mix(in srgb, var(--accent1) 72%, var(--deepBurgundy)))",
            border: "1px solid color-mix(in srgb, var(--deepBurgundy) 40%, transparent)",
            boxShadow: "0 16px 36px var(--shadow)",
            marginBottom: 16,
          }}
        >
          <div style={{ padding: "4px 4px 10px", color: "var(--btnPrimaryText)" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.85,
                marginBottom: 4,
              }}
            >
              {t({ nl: "Op je plank", en: "On your shelf" }, lang)}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display), Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {t({ nl: "Barcode scannen", en: "Scan barcode" }, lang)}
            </div>
          </div>
          <Scanner onDetected={onDetected} onClose={() => router.push("/library")} />
          {lastScan ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--btnPrimaryText)", opacity: 0.85, textAlign: "center" }}>
              {t({ nl: "Laatste scan: ", en: "Last scan: " }, lang)}
              <span style={{ fontWeight: 600 }}>{lastScan}</span>
            </div>
          ) : null}
        </div>
      )}

      {!hasIsbnParam && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--accent1)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              padding: 8,
            }}
          >
            {showManual
              ? t({ nl: "Camera tonen", en: "Show camera" }, lang)
              : t({ nl: "Liever ISBN typen?", en: "Prefer typing the ISBN?" }, lang)}
          </button>
        </div>
      )}

      {showManual && !hasIsbnParam && (
        <div
          style={{
            borderRadius: 20,
            border: "1px solid var(--border)",
            background: "var(--panelSolid)",
            padding: 16,
            animation: "seFadeUp 220ms ease",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
            {t({ nl: "ISBN handmatig", en: "ISBN manually" }, lang)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="manual-isbn-input"
              name="manual-isbn-input"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              inputMode="numeric"
              placeholder={t({ nl: "Bijv. 9789022591260", en: "E.g. 9789022591260" }, lang)}
              aria-label={t({ nl: "ISBN invoeren", en: "Enter ISBN" }, lang)}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--panel2)",
                padding: "10px 12px",
                fontSize: 14,
                color: "var(--text)",
              }}
            />
            <button
              onClick={submitManual}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radiusButton)",
                background: "var(--btnPrimaryBg)",
                color: "var(--btnPrimaryText)",
                fontSize: 14,
                fontWeight: 700,
                border: 0,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              type="button"
            >
              {t({ nl: "Zoek", en: "Search" }, lang)}
            </button>
          </div>
        </div>
      )}

      {!isProUser() && (
        <div
          style={{
            fontSize: 13,
            marginTop: 28,
            textAlign: "center",
            color: "var(--muted)",
            fontWeight: 500,
          }}
        >
          {t({ nl: "Demo · max. 10 boeken", en: "Demo · max. 10 books" }, lang)}
        </div>
      )}

      <style>{`
        @keyframes seFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
