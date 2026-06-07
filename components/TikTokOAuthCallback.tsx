"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function TikTokOAuthCallbackInner() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  useEffect(() => {
    if (!code) return;
    try {
      sessionStorage.setItem("se:tiktok_oauth_code", code);
    } catch {
      // ignore
    }
  }, [code]);

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          inset: "auto 12px 80px 12px",
          maxWidth: 480,
          margin: "0 auto",
          left: 0,
          right: 0,
          zIndex: 300000,
          padding: "16px 18px",
          borderRadius: 14,
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.35)",
          color: "var(--text)",
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#f87171" }}>TikTok OAuth mislukt</strong>
        <div style={{ marginTop: 8, opacity: 0.9 }}>
          {error}
          {errorDesc ? `: ${decodeURIComponent(errorDesc)}` : ""}
        </div>
      </div>
    );
  }

  if (!code) return null;

  const cmd = `npm run tiktok:auth -- ${code}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: "auto 12px 80px 12px",
        maxWidth: 480,
        margin: "0 auto",
        left: 0,
        right: 0,
        zIndex: 300000,
        padding: "16px 18px",
        borderRadius: 14,
        background: "var(--panel)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 1.5,
        boxShadow: "0 8px 32px var(--shadow)",
      }}
    >
      <strong>TikTok code ontvangen</strong>
      <p style={{ margin: "8px 0 12px", opacity: 0.85 }}>
        Voer op je pc uit in de projectmap:
      </p>
      <code
        style={{
          display: "block",
          padding: "10px 12px",
          borderRadius: 8,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          fontSize: 12,
          wordBreak: "break-all",
          marginBottom: 12,
        }}
      >
        {cmd}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(cmd).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 10,
          border: "none",
          background: "var(--accent1)",
          color: "#fff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {copied ? "✓ Gekopieerd" : "Kopieer commando"}
      </button>
    </div>
  );
}

export function TikTokOAuthCallback() {
  return (
    <Suspense fallback={null}>
      <TikTokOAuthCallbackInner />
    </Suspense>
  );
}
