"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DebugPage() {
  const router = useRouter();
  const [earlyError, setEarlyError] = useState<string | null>(null);
  const [lastClientError, setLastClientError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const early = localStorage.getItem("__early_error");
      if (early) {
        setEarlyError(early);
      }
    } catch {
      // ignore
    }

    try {
      const last = sessionStorage.getItem("__last_client_error");
      if (last) {
        setLastClientError(last);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClear = () => {
    try {
      localStorage.removeItem("__early_error");
      sessionStorage.removeItem("__last_client_error");
    } catch {
      // ignore
    }
    location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#000",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: "14px",
        lineHeight: "1.6",
      }}
    >
      <h1 style={{ color: "#ff4444", marginTop: 0 }}>Debug: Error Logs</h1>

      <div style={{ marginBottom: "24px", padding: "12px", backgroundColor: "#1a1a1a", borderRadius: "4px" }}>
        <h2 style={{ color: "#888", marginTop: 0, marginBottom: "8px" }}>Navigation</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "8px 12px",
              backgroundColor: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Home
          </button>
          <a href="/scan" style={{ color: "#6d5efc", textDecoration: "underline" }}>Scan</a>
          <a href="/library" style={{ color: "#6d5efc", textDecoration: "underline" }}>Library</a>
        </div>
      </div>

      {earlyError ? (
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#ff8888" }}>Early Error (localStorage)</h2>
          <pre
            style={{
              marginTop: "8px",
              padding: "12px",
              backgroundColor: "#1a1a1a",
              borderRadius: "4px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {earlyError}
          </pre>
        </div>
      ) : (
        <div style={{ marginBottom: "24px", color: "#888" }}>
          <h2>Early Error (localStorage)</h2>
          <p>No early error logged.</p>
        </div>
      )}

      {lastClientError ? (
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#ff8888" }}>Last Client Error (sessionStorage)</h2>
          <pre
            style={{
              marginTop: "8px",
              padding: "12px",
              backgroundColor: "#1a1a1a",
              borderRadius: "4px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {lastClientError}
          </pre>
        </div>
      ) : (
        <div style={{ marginBottom: "24px", color: "#888" }}>
          <h2>Last Client Error (sessionStorage)</h2>
          <p>No client error logged.</p>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <button
          onClick={handleClear}
          style={{
            padding: "12px 24px",
            backgroundColor: "#444",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Clear + reload
        </button>
      </div>
    </div>
  );
}

