"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Scanner } from "@/components/Scanner";
import { lookupByIsbn } from "@/lib/lookup";
import { upsertBook } from "@/lib/storage";

export default function ScanPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(/android|iphone|ipad|ipod/.test(ua));
  }, []);
  
  const [code, setCode] = useState<string>("");
  const [manual, setManual] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const desktopNotice = {
    padding: 16,
    borderRadius: 16,
    background: "#18181c",
    border: "1px solid #2a2a32",
  } as const;
  
  async function handleIsbn(isbnRaw: string) {
    const isbn = isbnRaw.trim();
    if (!isbn) return;

    setLoading(true);
    setTitle("");
    setCoverUrl("");
    setAuthors([]);
    setCode(isbn);

    try {
      const data = await lookupByIsbn(isbn);
      setTitle(data.title || "(Title not found)");
      setCoverUrl(data.coverUrl || "");
      setAuthors(data.authors || []);
    } finally {
      setLoading(false);
    }
  }

  function saveToShelf() {
    if (!code) return;

    upsertBook({
      id: crypto.randomUUID(),
      isbn13: code,
      title: title || "(Unknown title)",
      authors: authors || [],
      coverUrl: coverUrl || "",
      status: "TBR",
      addedAt: Date.now(),
      updatedAt: Date.now(),
    });

    router.push("/library");
  }

  function reset() {
    setCode("");
    setTitle("");
    setCoverUrl("");
    setAuthors([]);
    setManual("");
    setLoading(false);
  }

  return (
    <main style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <div style={topbar}>
        <h1 style={{ margin: 0 }}>Scan</h1>
        <Link href="/">
          <button style={btnSecondary}>Home</button>
        </Link>
      </div>

      {!code ? (
        <>
          {isMobile ? (
            <Scanner key="scanner" onDetected={(c) => handleIsbn(c)} />
          ) : (
            <div style={desktopNotice}>
              <p style={{ marginTop: 0 }}>Scanning works on mobile 📱</p>
              <p style={{ color: "#b7b7b7" }}>Use the ISBN field below on desktop.</p>
            </div>
          )}




          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <label style={{ color: "#b7b7b7" }}>Or enter ISBN-13 manually</label>
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="9781234567890"
              style={input}
            />
            <button
              style={btnPrimary}
              onClick={() => handleIsbn(manual)}
              disabled={manual.trim().length < 10}
            >
              Use this ISBN
            </button>
          </div>
        </>
      ) : (
        <div style={card}>
          {loading ? (
            <p style={{ color: "#b7b7b7", margin: 0, fontSize: 16 }}>
              Looking up book…
            </p>
          ) : (
            <>
              {coverUrl && (
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
                    />
                  )}
                  
             

              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>
                  {title || "(Unknown title)"}
                </div>

                {authors.length > 0 && (
                  <div style={{ color: "#cfcfe6", fontSize: 15, fontWeight: 600 }}>
                    by {authors.join(", ")}
                  </div>
                )}

                <div style={{ color: "#8f8fa3", fontSize: 12 }}>ISBN: {code}</div>
              </div>
            </>
          )}

          <button style={btnPrimaryBig} onClick={saveToShelf} disabled={loading}>
            Save to shelf
          </button>

          <div style={{ display: "grid", gap: 10 }}>
            <button style={btnSecondary} onClick={reset}>
              Scan another
            </button>
            <Link href="/library">
              <button style={btnSecondary}>Go to My Shelf</button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

const topbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const card: React.CSSProperties = {
  background: "#18181c",
  border: "1px solid #2a2a32",
  borderRadius: 20,
  padding: 14,
  display: "grid",
  gap: 12,
  marginTop: 12,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #2a2a32",
  background: "#0f0f12",
  color: "#fff",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: 0,
  background: "#6d5efc",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnPrimaryBig: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 18,
  border: 0,
  background: "#6d5efc",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: 0,
  background: "#2a2a32",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};
