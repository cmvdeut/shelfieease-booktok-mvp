"use client";

import { useState, useEffect } from "react";

interface PromoCode {
  code: string;
  createdAt: string;
  used: boolean;
  usedAt?: string;
}

export default function PromoAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [checking, setChecking] = useState(false);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("se:admin:auth");
      if (auth === "true") {
        setAuthenticated(true);
      }

      // Load codes from localStorage
      const saved = localStorage.getItem("se:promo:codes");
      if (saved) {
        try {
          setCodes(JSON.parse(saved));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setPasswordError("");

    try {
      const res = await fetch("/api/admin/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.valid) {
        setAuthenticated(true);
        localStorage.setItem("se:admin:auth", "true");
        setPassword("");
      } else {
        setPasswordError(data.error || "Invalid password");
        setPassword("");
      }
    } catch (error) {
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  // Show login form if not authenticated
  if (!authenticated) {
    return (
      <main style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 8 }}>Admin Access</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          Enter password to access promo code generator
        </p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={checking}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 16,
                backgroundColor: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                outline: "none",
              }}
              autoFocus
            />
            {passwordError && (
              <p style={{ color: "var(--danger)", fontSize: 14, marginTop: 8 }}>
                {passwordError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={checking || !password}
            style={{
              width: "100%",
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: checking || !password ? "var(--muted)" : "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: checking || !password ? "not-allowed" : "pointer",
            }}
          >
            {checking ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/promo/generate", {
        method: "POST",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.code) {
        const newCode: PromoCode = {
          code: data.code,
          createdAt: new Date().toISOString(),
          used: false,
        };
        const updated = [newCode, ...codes];
        setCodes(updated);
        
        // Save to localStorage
        localStorage.setItem("se:promo:codes", JSON.stringify(updated));
      } else {
        throw new Error("No code returned from API");
      }
    } catch (error) {
      console.error("Failed to generate code:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to generate code: ${errorMessage}\n\nMake sure the dev server is running on port 3000.`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/unlock?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyCodeOnly = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("se:admin:auth");
    setAuthenticated(false);
  };

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Promo Code Generator</h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Generate unique promo codes to give away free Pro access
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: 32 }}>
        <button
          onClick={generateCode}
          disabled={generating}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            backgroundColor: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: generating ? "not-allowed" : "pointer",
            opacity: generating ? 0.6 : 1,
          }}
        >
          {generating ? "Generating..." : "Generate New Code"}
        </button>
      </div>

      {codes.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 16 }}>Generated Codes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {codes.map((promo, idx) => (
              <div
                key={idx}
                style={{
                  padding: 16,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  backgroundColor: "var(--panel)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                    {promo.code}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    Created: {new Date(promo.createdAt).toLocaleString()}
                    {promo.used && (
                      <span style={{ color: "var(--accent)", marginLeft: 8 }}>
                        • Used
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => copyCodeOnly(promo.code)}
                    style={{
                      padding: "8px 16px",
                      fontSize: 14,
                      backgroundColor: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {copied === promo.code ? "Copied!" : "Copy Code"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(promo.code)}
                    style={{
                      padding: "8px 16px",
                      fontSize: 14,
                      backgroundColor: "var(--accent)",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {copied === promo.code ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {codes.length === 0 && (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--muted)",
            border: "1px dashed var(--border)",
            borderRadius: 8,
          }}
        >
          No codes generated yet. Click "Generate New Code" to create one.
        </div>
      )}
    </main>
  );
}
