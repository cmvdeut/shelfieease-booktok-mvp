"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Scanner } from "@/components/Scanner";
import { lookupByIsbn } from "@/lib/lookup";
import { upsertBook } from "@/lib/storage";

export default function ScanPage() {
  const router = useRouter();

  // UI state
  const [scannerOn, setScannerOn] = useState(false);
  const [code, setCode] = useState<string>("");
  const [manual, setManual] = useState<string>("");

  // Book state
  const [title, setTitle] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("");

  // Anti-loop / anti-spam (belangrijk!)
  const inFlightRef = useRef(false);
  const lastIsbnRef = useRef<string>("");
  const lastAtRef = useRef<number>(0);

  function normalizeIsbn(raw: string) {
    return (raw || "").replace(/[^0-9X]/gi, "").trim();
  }

  async function handleIsbn(raw: string) {
    const isbn = normalizeIsbn(raw);
    if (!isbn) return;

    // 1) Als we al bezig zijn: negeren
    if (inFlightRef.current) return;

    // 2) Zelfde isbn die meteen opnieuw binnenkomt: negeren (2s throttle)
    const now = Date.now();
    if (isbn === lastIsbnRef.current && now - lastAtRef.current < 2000) return;

    lastIsbnRef.current = isbn;
    lastAtRef.current = now;
    inFlightRef.current = true;

    // UI: stop scanner direct (dit voorkomt “page unresponsive”)
    setScannerOn(false);

    setStatusText("Looking up book…");
    setLoading(true);

    setCode(isbn);
    setTitle("");
    setCoverUrl("");
    setAuthors([]);

    try {
      const data = await lookupByIsbn(isbn);
      setTitle(data.title || "(Title not found)");
      setAuthors(data.authors || []);
      setCoverUrl(data.coverUrl || "");
      setStatusText("");
    } catch {
      setStatusText("Could not look up this ISBN. Try manual search.");
    } finally {
      setLoading(false);
      // Let op: lock blijft aan tot reset / scan another
      // Zo voorkom je dat dezelfde barcode opnieuw de flow triggert.
    }
  }

  function resetScan() {
    setScannerOn(false);
    setCode("");
    setManual("");
    setTitle("");
    setCoverUrl("");
    setAuthors([]);
    setLoading(false);
    setStatusText("");

    inFlightRef.current = false;
    lastIsbnRef.current = "";
    lastAtRef.current = 0;
  }

  function startScan() {
    resetScan();
    setScannerOn(true);
  }

  function saveToShelf() {
    // We houden dit bewust compatibel: upsertBook regelt eventueel shelfId intern.
    // (Als jouw Book type wél shelfId verplicht heeft, laat het me weten; dan pas ik dit aan.)
    upsertBook({
      id: crypto.randomUUID(),
      isbn13: code,
      title: title || "(Unknown title)",
      authors: authors || [],
      coverUrl: coverUrl || "",
      status: "TBR",
      addedAt: Date.now(),
      updatedAt: Date.now(),
    } as any);

    router.push("/library");
  }

  return (
    <main style={page}>
      <div style={topRow}>
        <h1 style={{ margin: 0 }}>Scan</h1>
        <Link href="/library">
          <button style={btnSecondary}>My Shelf</button>
        </Link>
      </div>

      {/* Scanner area */}
      {!code ? (
        <>
          <div style={card}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Scan an ISBN barcode</h2>
            <p style={muted}>
              Tap start, point your camera at the barcode, and we’ll fetch the book info.
            </p>

            {!scannerOn ? (
              <button style={btnPrimary} onClick={startScan}>
                Start scanning
              </button>
            ) : (
              <>
                <Scanner onDetected={(c) => handleIsbn(c)} />
                <button style={btnGhost} onClick={() => setScannerOn(false)}>
                  Stop camera
                </button>
              </>
            )}

            <div style={divider} />
            <label style={label}>Or enter ISBN manually</label>
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="9781234567890"
              inputMode="numeric"
              style={input}
            />
            <button
              style={btnPrimary}
              onClick={() => handleIsbn(manual)}
              disabled={normalizeIsbn(manual).length < 10}
            >
              Use this ISBN
            </button>
          </div>
        </>
      ) : (
        /* Result area */
        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 18 }}>✅ Book found</h2>

          {loading ? (
            <p style={muted}>{statusText || "Looking up book…"}</p>
          ) : (
            <>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  style={{
                    width: "100%",
                    maxHeight: 420,
                    objectFit: "cover",
                    borderRadius: 18,
                    border: "1px solid #2a2a32",
                  }}
                  onError={(e) => {
                    // Als cover faalt: verberg img (UI blijft mooi)
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : null}

              <div style={{ display: "grid", gap: 6 }}>
                <p style={{ fontWeight: 950, margin: 0, fontSize: 18 }}>{title}</p>

                {authors.length > 0 ? (
                  <p style={{ margin: 0, color: "#cfcfe6", fontWeight: 750 }}>
                    by {authors.join(", ")}
                  </p>
                ) : null}

                <p style={{ margin: 0, color: "#8f8fa3" }}>ISBN: {code}</p>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <button style={btnPrimary} onClick={saveToShelf} disabled={loading}>
                  Save to shelf
                </button>

                <button style={btnGhost} onClick={resetScan}>
                  Scan another
                </button>
              </div>
            </>
          )}

          {statusText && !loading ? <p style={{ ...muted, marginTop: 10 }}>{statusText}</p> : null}
        </div>
      )}
    </main>
  );
}

/* ---------- styles ---------- */

const page: React.CSSProperties = {
  padding: 16,
  maxWidth: 720,
  margin: "0 auto",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const card: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(109,94,252,0.18), rgba(255,73,240,0.08) 45%, rgba(0,0,0,0) 70%), #14141a",
  border: "1px solid #2a2a32",
  borderRadius: 22,
  padding: 14,
  display: "grid",
  gap: 10,
  boxShadow: "0 16px 46px rgba(0,0,0,0.45)",
};

const muted: React.CSSProperties = {
  color: "#b7b7b7",
  margin: 0,
};

const label: React.CSSProperties = {
  color: "#cfcfe6",
  fontSize: 13,
  fontWeight: 800,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #2a2a32",
  background: "#0f0f12",
  color: "#fff",
  outline: "none",
};

const divider: React.CSSProperties = {
  height: 1,
  width: "100%",
  background: "#2a2a32",
  margin: "6px 0",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 16,
  border: 0,
  background: "linear-gradient(135deg, #6d5efc, #ff49f0)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 16,
  border: "1px solid #2a2a32",
  background: "#15151c",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 16,
  border: "1px solid #2a2a32",
  background: "#15151c",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
