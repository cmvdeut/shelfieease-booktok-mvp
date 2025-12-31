"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Scanner from "@/components/Scanner";
import { detectUiLang, t } from "@/lib/i18n";

function normalizeIsbn(raw: string) {
  return raw.toUpperCase().replace(/[^0-9X]/g, "");
}

export default function ScanPage() {
  const router = useRouter();
  const lang = detectUiLang();
  const [manual, setManual] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [hasIsbnParam, setHasIsbnParam] = useState(false);

  const manualNormalized = useMemo(() => normalizeIsbn(manual), [manual]);

  // Handle ISBN query parameter from native scanner
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const params = new URLSearchParams(window.location.search);
    const isbnParam = params.get("isbn");
    if (isbnParam) {
      const normalized = normalizeIsbn(isbnParam);
      if (normalized) {
        setHasIsbnParam(true);
        // Use the same flow as normal detection - navigate to library with addIsbn
        router.replace(`/library?addIsbn=${encodeURIComponent(normalized)}`);
      }
    }
  }, [router]);

  const onDetected = useCallback(
    (isbn: string) => {
      setLastScan(isbn);

      // Navigate to library with addIsbn parameter
      router.push(`/library?addIsbn=${encodeURIComponent(isbn)}`);
    },
    [router]
  );

  const submitManual = useCallback(() => {
    const v = manualNormalized;
    if (!v) return;
    router.push(`/library?addIsbn=${encodeURIComponent(v)}`);
  }, [manualNormalized, router]);

  return (
    <div style={{ 
      minHeight: "100dvh",
      padding: "16px 16px env(safe-area-inset-bottom, 40px)",
      paddingTop: "env(safe-area-inset-top, 16px)",
      background: "var(--bg)", 
      color: "var(--text)" 
    }} className="scan-page-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => router.push("/")}
          type="button"
        >
          ← {t({ nl: "Home", en: "Home" }, lang)}
        </button>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>{t({ nl: "Scan ISBN", en: "Scan ISBN" }, lang)}</div>
        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--panel)",
            color: "var(--text)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => router.push("/library")}
          type="button"
        >
          {t({ nl: "Mijn shelf", en: "My Shelf" }, lang)}
        </button>
      </div>

      {/* Scanner - only show if no ISBN parameter (to avoid camera permissions) */}
      {!hasIsbnParam && (
        <div className="mb-6">
          <Scanner
            onDetected={onDetected}
            onClose={() => router.push("/")}
          />
          {lastScan ? (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
              {t({ nl: "Laatste scan: ", en: "Last scan: " }, lang)}<span style={{ fontWeight: 600 }}>{lastScan}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Loading state when ISBN parameter is present */}
      {hasIsbnParam && (
        <div style={{ 
          padding: "40px 20px", 
          textAlign: "center",
          color: "var(--text)",
          fontSize: 14
        }}>
          {t({ nl: "ISBN wordt verwerkt...", en: "Processing ISBN..." }, lang)}
        </div>
      )}

      {/* Handmatige fallback */}
      <div style={{
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--panel)",
        padding: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>{t({ nl: "Of voer ISBN handmatig in", en: "Or enter ISBN manually" }, lang)}</div>

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
              padding: "8px 12px",
              fontSize: 14,
              color: "var(--text)",
            }}
          />
          <button
            onClick={submitManual}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--accent1), var(--accent2))",
              color: "var(--text)",
              fontSize: 14,
              fontWeight: 600,
              border: 0,
              cursor: "pointer",
            }}
            type="button"
          >
            {t({ nl: "Zoek", en: "Search" }, lang)}
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          {t({ nl: "Tip: kopieer ook gerust een ISBN uit de productpagina van een boek.", en: "Tip: feel free to copy an ISBN from a book's product page." }, lang)}
        </div>
      </div>
    </div>
  );
}
