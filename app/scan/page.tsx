"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Scanner from "@/components/Scanner";

function normalizeIsbn(raw: string) {
  return raw.toUpperCase().replace(/[^0-9X]/g, "");
}

export default function ScanPage() {
  const router = useRouter();
  const [manual, setManual] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);

  const manualNormalized = useMemo(() => normalizeIsbn(manual), [manual]);

  const onDetected = useCallback(
    (isbn: string) => {
      setLastScan(isbn);

      // Navigate to library with ISBN parameter
      router.push(`/library?isbn=${encodeURIComponent(isbn)}`);
    },
    [router]
  );

  const submitManual = useCallback(() => {
    const v = manualNormalized;
    if (!v) return;
    router.push(`/library?isbn=${encodeURIComponent(v)}`);
  }, [manualNormalized, router]);

  return (
    <div style={{ minHeight: "100dvh", padding: "16px 16px 40px", background: "var(--bg)", color: "var(--text)" }}>
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
          ← Home
        </button>
        <div style={{ fontSize: 14, color: "var(--muted)" }}>Scan ISBN</div>
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
          My Shelf
        </button>
      </div>

      {/* Scanner */}
      <div className="mb-6">
        <Scanner
          onDetected={onDetected}
          onClose={() => router.push("/")}
        />
        {lastScan ? (
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
            Laatste scan: <span style={{ fontWeight: 600 }}>{lastScan}</span>
          </div>
        ) : null}
      </div>

      {/* Handmatige fallback */}
      <div style={{
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--panel)",
        padding: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Of voer ISBN handmatig in</div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="Bijv. 9789022591260"
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
            Zoek
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          Tip: kopieer ook gerust een ISBN uit de productpagina van een boek.
        </div>
      </div>
    </div>
  );
}
