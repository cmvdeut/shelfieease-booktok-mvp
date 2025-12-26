import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100dvh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div style={{ position: "relative", maxWidth: 448, margin: "0 auto", padding: "28px 24px 36px" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "grid", height: 44, width: 44, placeItems: "center", borderRadius: 16, background: "var(--panel)", border: "1px solid var(--border)", boxShadow: "0 4px 12px var(--shadow)" }}>
            <span style={{ fontSize: 24 }}>📚</span>
          </div>

          <div>
            <h1 style={{ fontSize: "clamp(1.875rem, 2.5rem, 2.25rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1 }}>
              ShelfieEase
            </h1>
            <p style={{ marginTop: 4, fontSize: 14, color: "var(--muted)" }}>
              Scan • Shelf • Share
            </p>
          </div>
        </header>

        {/* Hero */}
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "clamp(1.25rem, 1.5rem, 1.5rem)", fontWeight: 600, lineHeight: 1.25, color: "var(--text)" }}>
            Maak je BookTok-shelf in seconden.
          </h2>
          <p style={{ marginTop: 8, fontSize: "clamp(0.875rem, 1rem, 1rem)", color: "var(--muted)" }}>
            Scan een ISBN of typ 'm in. Zet boeken in shelves. Klaar.
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
                background: "linear-gradient(135deg, var(--accent1), var(--accent2))",
                boxShadow: `0 8px 24px var(--shadow)`,
                border: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 20 }}>📷</span>
              Scan a book
              <span style={{ opacity: 0.8 }}>→</span>
            </Link>

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
                <span>📚</span> My Shelf
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
                <span>⌨️</span> Handmatig
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Geen stress stats</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  TBR • Reading • Finished
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Shelves met emoji</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  Mini-collecties (📖🌙🔥💜)
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
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Deel je Shelfie</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  9:16 share-card
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
            Tip: Handmatig invoeren blijft altijd mogelijk.
          </footer>
        </section>
      </div>
    </main>
  );
}
