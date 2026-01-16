"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("__last_client_error");
      if (stored) {
        setLastError(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const errorStack = error.stack || "";
  const truncatedStack = errorStack.length > 4000 
    ? errorStack.substring(0, 4000) + "\n... (truncated)"
    : errorStack;

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      // ignore
    }
    location.reload();
  };

  return (
    <html>
      <body>
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
          <h1 style={{ color: "#ff4444", marginTop: 0 }}>Application Error</h1>

          {error.name && (
            <div style={{ marginBottom: "16px" }}>
              <strong>Error Name:</strong> {error.name}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <strong>Error Message:</strong>
            <div style={{ marginTop: "8px", color: "#ff8888" }}>
              {error.message}
            </div>
          </div>

          {error.digest && (
            <div style={{ marginBottom: "16px" }}>
              <strong>Digest:</strong> {error.digest}
            </div>
          )}

          {truncatedStack && (
            <div style={{ marginBottom: "16px" }}>
              <strong>Stack Trace:</strong>
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
                {truncatedStack}
              </pre>
            </div>
          )}

          {lastError && (
            <div style={{ marginBottom: "16px" }}>
              <strong>Last Error (Session):</strong>
              <pre
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  backgroundColor: "#1a1a1a",
                  borderRadius: "4px",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#888",
                }}
              >
                {lastError}
              </pre>
            </div>
          )}

          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={reset}
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
              Try again
            </button>
            <button
              onClick={() => location.reload()}
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
              Reload
            </button>
            <button
              onClick={handleClearCache}
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
              Clear cache + reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}








